import { useState, useCallback, useEffect, useRef } from "react";
import { useSupabaseClient } from "../hooks/useSupabaseClient";
import packages from "../data/packages.js";
import themes from "../data/themes.js";

const STORAGE_KEY = "webuilder_preview_session";
const DEBOUNCE_MS = 1000;

const BLANK_TEMPLATE = {
  slug: "custom-builder",
  name: "Custom Website",
  category: "Professional",
  description: "A custom website built with the Adverse Builder",
  packageType: "semi-dynamic",
  themeRef: "",
  sections: {
    hero: {
      headline: "Your Business Name",
      subheadline: "Your tagline here",
      ctaText: "Get Started",
      heroImage: "",
    },
    services: {
      heading: "Our Services",
      items: [
        {
          title: "Service 1",
          description: "Describe your service",
          icon: "⭐",
        },
      ],
    },
    gallery: { heading: "Our Work", images: [] },
    testimonials: {
      heading: "What Clients Say",
      items: [
        {
          quote: "Great service!",
          author: "Happy Client",
          role: "Customer",
        },
      ],
    },
    cta: {
      heading: "Ready to Get Started?",
      body: "Contact us today.",
      buttonText: "Contact Us",
    },
    contact: {
      heading: "Get In Touch",
      phone: "",
      email: "",
      address: "",
      hours: "",
    },
  },
};

const INITIAL_STATE = {
  step: "select",
  config: null,
  activeTheme: null,
  baseThemeIndex: 0,
  category: null,
  packageSlug: null,
  customColors: null,
  hasRestoredSession: false,
  supabaseProjectId: null,
};

/**
 * Safely read from localStorage. Returns null if unavailable or corrupted.
 */
function readFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Basic schema validation — must have required fields
    if (!parsed || typeof parsed !== "object" || !parsed.step) {
      return null;
    }
    return parsed;
  } catch {
    // localStorage unavailable or JSON corrupted
    return null;
  }
}

/**
 * Safely write to localStorage. Returns true on success, false on failure.
 */
function writeToStorage(state) {
  try {
    const payload = {
      step: state.step,
      config: state.config,
      baseThemeIndex: state.baseThemeIndex,
      category: state.category,
      packageSlug: state.packageSlug,
      customColors: state.customColors,
      supabaseProjectId: state.supabaseProjectId,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (e) {
    // QuotaExceededError or SecurityError
    if (e?.name === "QuotaExceededError") {
      console.warn(
        "[useBuilderState] localStorage quota exceeded. Continuing with in-memory state."
      );
    } else {
      console.warn(
        "[useBuilderState] localStorage unavailable:",
        e?.message
      );
    }
    return false;
  }
}

/**
 * Remove the session entry from localStorage.
 */
function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore — storage may be unavailable
  }
}

/**
 * Deep clone an object using structured clone (or JSON fallback).
 */
function deepCopy(obj) {
  if (typeof structuredClone === "function") {
    return structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Resolve the active theme object from state fields.
 * Merges customColors on top of the base theme if present.
 */
function resolveTheme(packageSlug, baseThemeIndex, customColors) {
  const packageThemes = themes[packageSlug];
  if (!packageThemes || packageThemes.length === 0) return null;

  const index = Math.min(baseThemeIndex, packageThemes.length - 1);
  const baseTheme = deepCopy(packageThemes[index]);

  if (customColors && Object.keys(customColors).length > 0) {
    return {
      ...baseTheme,
      colors: { ...baseTheme.colors, ...customColors },
    };
  }

  return baseTheme;
}

/**
 * useBuilderState — Central state management hook for the builder.
 *
 * @param {Object} options
 * @param {string|null} options.userId - Clerk user ID (null if unauthenticated).
 * @returns {[Object, Object]} [state, actions]
 */
export function useBuilderState({ userId = null } = {}) {
  const supabase = useSupabaseClient();

  const [state, setState] = useState(() => {
    // Check if a previous session exists (don't auto-restore, just flag it)
    const saved = readFromStorage();
    if (saved) {
      return { ...INITIAL_STATE, _hasSavedSession: true };
    }
    return { ...INITIAL_STATE, _hasSavedSession: false };
  });

  const [isSavingToSupabase, setIsSavingToSupabase] = useState(false);
  const [supabaseSaveError, setSupabaseSaveError] = useState(null);

  const debounceRef = useRef(null);
  const supabaseDebounceRef = useRef(null);
  const storageAvailableRef = useRef(true);
  const supabaseLoadedRef = useRef(false);

  // Debounced localStorage persistence
  useEffect(() => {
    // Only persist when we're in the 'edit' step with actual config
    if (state.step !== "edit" || !state.config) return;
    // Don't persist the internal _hasSavedSession flag
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const success = writeToStorage(state);
      if (!success) {
        storageAvailableRef.current = false;
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [state]);

  // Debounced Supabase persistence (only when authenticated)
  useEffect(() => {
    if (!userId || !supabase) return;
    if (state.step !== "edit" || !state.config) return;

    if (supabaseDebounceRef.current) {
      clearTimeout(supabaseDebounceRef.current);
    }

    supabaseDebounceRef.current = setTimeout(() => {
      saveToSupabaseInternal(state);
    }, DEBOUNCE_MS);

    return () => {
      if (supabaseDebounceRef.current) {
        clearTimeout(supabaseDebounceRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, userId, supabase]);

  // Load from Supabase on mount when authenticated
  useEffect(() => {
    if (!userId || !supabase || supabaseLoadedRef.current) return;
    supabaseLoadedRef.current = true;

    loadFromSupabaseInternal().then((supabaseData) => {
      if (!supabaseData) return;

      const localData = readFromStorage();
      const localTimestamp = localData?.timestamp || 0;
      const supabaseTimestamp = supabaseData.updated_at
        ? new Date(supabaseData.updated_at).getTime()
        : 0;

      // If Supabase has a newer version, flag it for resume
      if (supabaseTimestamp > localTimestamp) {
        setState((prev) => ({
          ...prev,
          _hasSavedSession: true,
          _supabaseDraft: supabaseData,
        }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, supabase]);

  /**
   * Internal: Save current state to Supabase projects table as a draft.
   */
  async function saveToSupabaseInternal(currentState) {
    if (!userId || !supabase) return null;

    setIsSavingToSupabase(true);
    setSupabaseSaveError(null);

    try {
      const projectPayload = {
        name: currentState.config?.name || "Custom Website",
        service_tier: currentState.category,
        intake_data: currentState.config,
      };

      let projectId = currentState.supabaseProjectId;

      if (projectId) {
        // Update existing draft
        const { error } = await supabase
          .from("projects")
          .update(projectPayload)
          .eq("id", projectId);
        if (error) throw error;
      } else {
        // Find existing draft or create new one
        const { data: existing } = await supabase
          .from("projects")
          .select("id")
          .eq("client_id", userId)
          .eq("status", "draft")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existing?.id) {
          projectId = existing.id;
          const { error } = await supabase
            .from("projects")
            .update(projectPayload)
            .eq("id", projectId);
          if (error) throw error;
        } else {
          const { data, error } = await supabase
            .from("projects")
            .insert({ ...projectPayload, client_id: userId, status: "draft" })
            .select("id")
            .single();
          if (error) throw error;
          projectId = data?.id;
        }
      }

      // Store the project ID in state
      if (projectId) {
        setState((prev) => ({
          ...prev,
          supabaseProjectId: projectId,
        }));
      }

      setIsSavingToSupabase(false);
      return projectId || null;
    } catch (err) {
      console.warn(
        "[useBuilderState] Supabase save failed, falling back to localStorage:",
        err?.message
      );
      setSupabaseSaveError(
        "Cloud save unavailable. Your progress is saved locally."
      );
      setIsSavingToSupabase(false);
      return null;
    }
  }

  /**
   * Internal: Load the most recent draft project from Supabase.
   */
  async function loadFromSupabaseInternal() {
    if (!userId || !supabase) return null;

    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("client_id", userId)
        .eq("status", "draft")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      return data || null;
    } catch (err) {
      console.warn(
        "[useBuilderState] Supabase load failed:",
        err?.message
      );
      return null;
    }
  }

  // --- Actions ---

  const selectTemplate = useCallback((slug) => {
    const pkg = packages.find((p) => p.slug === slug);
    if (!pkg) return;

    const config = deepCopy(pkg);
    config.packageType = "semi-dynamic";

    const packageThemes = themes[slug];
    const activeTheme =
      packageThemes && packageThemes.length > 0
        ? deepCopy(packageThemes[0])
        : null;

    setState((prev) => ({
      ...prev,
      step: "edit",
      config,
      activeTheme,
      baseThemeIndex: 0,
      category: pkg.category,
      packageSlug: slug,
      customColors: null,
      _hasSavedSession: false,
    }));
  }, []);

  const selectBlankTemplate = useCallback(() => {
    const config = deepCopy(BLANK_TEMPLATE);

    // Blank template uses Professional category themes as default
    const defaultSlug = "real-estate-agent";
    const packageThemes = themes[defaultSlug];
    const activeTheme =
      packageThemes && packageThemes.length > 0
        ? deepCopy(packageThemes[0])
        : null;

    setState((prev) => ({
      ...prev,
      step: "edit",
      config,
      activeTheme,
      baseThemeIndex: 0,
      category: "Professional",
      packageSlug: defaultSlug,
      customColors: null,
      _hasSavedSession: false,
    }));
  }, []);

  const updateField = useCallback((sectionKey, fieldPath, value) => {
    setState((prev) => {
      if (!prev.config || !prev.config.sections) return prev;

      const newConfig = deepCopy(prev.config);
      const section = newConfig.sections[sectionKey];
      if (!section) return prev;

      // fieldPath can be a dot-separated path like "items.0.title"
      const parts = fieldPath.split(".");
      let target = section;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        if (target[key] === undefined || target[key] === null) return prev;
        target = target[key];
      }
      target[parts[parts.length - 1]] = value;

      return { ...prev, config: newConfig };
    });
  }, []);

  const selectTheme = useCallback(
    (index) => {
      setState((prev) => {
        const slug = prev.packageSlug;
        if (!slug) return prev;

        const packageThemes = themes[slug];
        if (!packageThemes || index >= packageThemes.length) return prev;

        const activeTheme = deepCopy(packageThemes[index]);

        return {
          ...prev,
          activeTheme,
          baseThemeIndex: index,
          customColors: null,
        };
      });
    },
    []
  );

  const customizeColor = useCallback((tokenKey, value) => {
    setState((prev) => {
      const newCustomColors = { ...(prev.customColors || {}), [tokenKey]: value };
      const activeTheme = resolveTheme(
        prev.packageSlug,
        prev.baseThemeIndex,
        newCustomColors
      );

      return {
        ...prev,
        customColors: newCustomColors,
        activeTheme: activeTheme || prev.activeTheme,
      };
    });
  }, []);

  const resetTheme = useCallback(() => {
    setState((prev) => {
      const activeTheme = resolveTheme(
        prev.packageSlug,
        prev.baseThemeIndex,
        null
      );

      return {
        ...prev,
        customColors: null,
        activeTheme: activeTheme || prev.activeTheme,
      };
    });
  }, []);

  const getHandoffParams = useCallback(() => {
    return {
      package: state.config?.name || "",
      theme: state.activeTheme?.label || "",
    };
  }, [state.config, state.activeTheme]);

  const clearSession = useCallback(() => {
    clearStorage();
  }, []);

  const startFresh = useCallback(() => {
    clearStorage();
    setState({ ...INITIAL_STATE, _hasSavedSession: false });
  }, []);

  const resumeSession = useCallback(() => {
    // Check if we have a Supabase draft that's newer
    if (state._supabaseDraft) {
      const draft = state._supabaseDraft;
      const config = draft.intake_data;

      if (config) {
        const activeTheme = resolveTheme(
          config.slug || config.packageSlug,
          config.baseThemeIndex ?? 0,
          config.customColors
        );

        setState({
          step: "edit",
          config,
          activeTheme,
          baseThemeIndex: config.baseThemeIndex ?? 0,
          category: draft.service_tier || config.category || null,
          packageSlug: config.slug || config.packageSlug || null,
          customColors: config.customColors || null,
          hasRestoredSession: true,
          supabaseProjectId: draft.id || null,
          _hasSavedSession: false,
          _supabaseDraft: null,
        });
        return;
      }
    }

    const saved = readFromStorage();
    if (!saved) {
      setState((prev) => ({ ...prev, _hasSavedSession: false }));
      return;
    }

    // Reconstruct the active theme from saved state
    const activeTheme = resolveTheme(
      saved.packageSlug,
      saved.baseThemeIndex ?? 0,
      saved.customColors
    );

    setState({
      step: saved.step || "edit",
      config: saved.config || null,
      activeTheme,
      baseThemeIndex: saved.baseThemeIndex ?? 0,
      category: saved.category || null,
      packageSlug: saved.packageSlug || null,
      customColors: saved.customColors || null,
      hasRestoredSession: true,
      supabaseProjectId: saved.supabaseProjectId || null,
      _hasSavedSession: false,
      _supabaseDraft: null,
    });
  }, [state._supabaseDraft]);

  // Public action: Save to Supabase (for HandoffButton direct use)
  const saveToSupabase = useCallback(async () => {
    return saveToSupabaseInternal(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, userId, supabase]);

  // Public action: Load from Supabase (for HandoffButton direct use)
  const loadFromSupabase = useCallback(async () => {
    return loadFromSupabaseInternal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, supabase]);

  // Public state (strip internal flags)
  const publicState = {
    step: state.step,
    config: state.config,
    activeTheme: state.activeTheme,
    baseThemeIndex: state.baseThemeIndex,
    category: state.category,
    packageSlug: state.packageSlug,
    customColors: state.customColors,
    hasRestoredSession: state.hasRestoredSession || false,
    supabaseProjectId: state.supabaseProjectId,
    hasSavedSession: state._hasSavedSession || false,
    storageAvailable: storageAvailableRef.current,
    isSavingToSupabase,
    supabaseSaveError,
    isAuthenticated: !!userId,
  };

  const actions = {
    selectTemplate,
    selectBlankTemplate,
    updateField,
    selectTheme,
    customizeColor,
    resetTheme,
    getHandoffParams,
    clearSession,
    startFresh,
    resumeSession,
    saveToSupabase,
    loadFromSupabase,
  };

  return [publicState, actions];
}

export { BLANK_TEMPLATE, STORAGE_KEY };
