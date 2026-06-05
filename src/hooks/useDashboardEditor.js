import { useState, useCallback, useEffect, useRef } from "react";
import { useSupabaseClient } from "./useSupabaseClient";
import themes from "../data/themes.js";

const DEBOUNCE_MS = 1000;
const RETRY_MS = 3000;
const SAVED_DISPLAY_MS = 2000;

/**
 * Resolve the active theme object from slug, index, and custom colors.
 */
function resolveTheme(slug, baseThemeIndex, customColors) {
  const packageThemes = themes[slug];
  if (!packageThemes || packageThemes.length === 0) return null;
  const index = Math.min(baseThemeIndex, packageThemes.length - 1);
  const base = structuredClone(packageThemes[index]);
  if (customColors && Object.keys(customColors).length > 0) {
    return { ...base, colors: { ...base.colors, ...customColors } };
  }
  return base;
}

/**
 * useDashboardEditor — state management and auto-save for the dashboard editor.
 *
 * @param {Object} options
 * @param {string} options.projectId - Supabase project UUID
 * @param {object} options.intakeData - Initial intake_data from project fetch
 * @returns {[Object, Object]} [state, actions]
 */
export function useDashboardEditor({ projectId, intakeData }) {
  const supabase = useSupabaseClient();

  const [state, setState] = useState(() => {
    if (!intakeData) return { config: null, activeTheme: null, baseThemeIndex: 0, customColors: null, sectionOrder: [], saveStatus: "idle", isReadOnly: true, isPublished: false };
    const themeState = intakeData._themeState || {};
    const baseThemeIndex = themeState.baseThemeIndex || 0;
    const customColors = themeState.customColors || null;
    const sectionOrder = intakeData.sectionOrder || Object.keys(intakeData.sections || {});
    const activeTheme = resolveTheme(intakeData.slug, baseThemeIndex, customColors);
    return {
      config: intakeData,
      activeTheme,
      baseThemeIndex,
      customColors,
      sectionOrder,
      saveStatus: "idle",
      isReadOnly: intakeData.packageType === "static",
      isPublished: false,
    };
  });

  const debounceRef = useRef(null);
  const retryRef = useRef(null);
  const savedTimerRef = useRef(null);
  const dirtyRef = useRef(false);

  // Cleanup timers on unmount
  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (retryRef.current) clearTimeout(retryRef.current);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
  }, []);

  const saveRef = useRef(null);

  /**
   * Persist intake_data to Supabase.
   */
  const saveToSupabase = useCallback(async (config, sectionOrder, baseThemeIndex, customColors, isRetry = false) => {
    setState(s => ({ ...s, saveStatus: "saving" }));
    const payload = {
      ...config,
      sectionOrder,
      _themeState: { baseThemeIndex, customColors },
    };
    const { error } = await supabase
      .from("projects")
      .update({ intake_data: payload })
      .eq("id", projectId);

    if (error) {
      setState(s => ({ ...s, saveStatus: "error" }));
      if (!isRetry) {
        retryRef.current = setTimeout(() => {
          saveRef.current?.(config, sectionOrder, baseThemeIndex, customColors, true);
        }, RETRY_MS);
      }
      return;
    }
    dirtyRef.current = false;
    setState(s => ({ ...s, saveStatus: "saved" }));
    savedTimerRef.current = setTimeout(() => {
      setState(s => s.saveStatus === "saved" ? { ...s, saveStatus: "idle" } : s);
    }, SAVED_DISPLAY_MS);
  }, [supabase, projectId]);

  // Keep ref in sync for retry callback
  useEffect(() => { saveRef.current = saveToSupabase; }, [saveToSupabase]);

  /**
   * Schedule a debounced save.
   */
  const scheduleSave = useCallback((config, sectionOrder, baseThemeIndex, customColors) => {
    dirtyRef.current = true;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveToSupabase(config, sectionOrder, baseThemeIndex, customColors);
    }, DEBOUNCE_MS);
  }, [saveToSupabase]);

  // --- Actions ---

  const updateField = useCallback((sectionKey, fieldPath, value) => {
    setState(prev => {
      if (!prev.config?.sections?.[sectionKey]) return prev;
      const newConfig = structuredClone(prev.config);
      const parts = fieldPath.split(".");
      let target = newConfig.sections[sectionKey];
      for (let i = 0; i < parts.length - 1; i++) {
        if (target[parts[i]] == null) return prev;
        target = target[parts[i]];
      }
      target[parts[parts.length - 1]] = value;
      scheduleSave(newConfig, prev.sectionOrder, prev.baseThemeIndex, prev.customColors);
      return { ...prev, config: newConfig };
    });
  }, [scheduleSave]);

  const selectTheme = useCallback((index) => {
    setState(prev => {
      if (!prev.config) return prev;
      const activeTheme = resolveTheme(prev.config.slug, index, null);
      scheduleSave(prev.config, prev.sectionOrder, index, null);
      return { ...prev, activeTheme, baseThemeIndex: index, customColors: null };
    });
  }, [scheduleSave]);

  const customizeColor = useCallback((tokenKey, value) => {
    setState(prev => {
      const newColors = { ...(prev.customColors || {}), [tokenKey]: value };
      const activeTheme = resolveTheme(prev.config?.slug, prev.baseThemeIndex, newColors);
      scheduleSave(prev.config, prev.sectionOrder, prev.baseThemeIndex, newColors);
      return { ...prev, customColors: newColors, activeTheme: activeTheme || prev.activeTheme };
    });
  }, [scheduleSave]);

  const resetTheme = useCallback(() => {
    setState(prev => {
      const activeTheme = resolveTheme(prev.config?.slug, prev.baseThemeIndex, null);
      scheduleSave(prev.config, prev.sectionOrder, prev.baseThemeIndex, null);
      return { ...prev, customColors: null, activeTheme: activeTheme || prev.activeTheme };
    });
  }, [scheduleSave]);

  const reorderSections = useCallback((newOrder) => {
    setState(prev => {
      const newConfig = { ...prev.config, sectionOrder: newOrder };
      scheduleSave(newConfig, newOrder, prev.baseThemeIndex, prev.customColors);
      return { ...prev, sectionOrder: newOrder, config: newConfig };
    });
  }, [scheduleSave]);

  const publish = useCallback(async () => {
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("subscription_status")
      .single();

    if (profileErr || !profile || profile.subscription_status !== "active") {
      return { success: false, reason: "no_subscription" };
    }

    const { error } = await supabase
      .from("projects")
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("id", projectId);

    if (error) return { success: false, reason: "error" };

    setState(prev => ({ ...prev, isPublished: true }));
    return { success: true, url: `https://sites.adversesolutions.com/${state.config?.slug || "site"}` };
  }, [supabase, projectId, state.config?.slug]);

  const publicState = {
    config: state.config,
    activeTheme: state.activeTheme,
    baseThemeIndex: state.baseThemeIndex,
    customColors: state.customColors,
    sectionOrder: state.sectionOrder,
    saveStatus: state.saveStatus,
    isReadOnly: state.isReadOnly,
    isPublished: state.isPublished,
  };

  const actions = { updateField, selectTheme, customizeColor, resetTheme, reorderSections, publish };

  return [publicState, actions];
}
