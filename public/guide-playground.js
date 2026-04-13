// DSA Code Playground — guide-playground.js
// Interactive code playgrounds for the DSA guide (public/dsa.html)
// Vanilla JS ES module — no React, no build step

/* ------------------------------------------------------------------ */
/*  Sandbox Worker (inline Blob)                                      */
/* ------------------------------------------------------------------ */

const workerScript = `
  "use strict";

  self.onmessage = function (e) {
    var msg = e.data;
    var id = msg.id;
    var code = msg.code;
    var timeout = msg.timeout || 3000;
    var logs = [];
    var result = undefined;
    var error = undefined;
    var timedOut = false;

    // Override console methods to capture output
    var _log = console.log;
    var _warn = console.warn;
    var _error = console.error;

    function stringify(val) {
      if (val === undefined) return "undefined";
      if (val === null) return "null";
      if (typeof val === "function") return val.toString();
      try {
        return typeof val === "object" ? JSON.stringify(val) : String(val);
      } catch (_) {
        return String(val);
      }
    }

    console.log = function () {
      var args = [];
      for (var i = 0; i < arguments.length; i++) args.push(stringify(arguments[i]));
      logs.push({ type: "log", args: args });
    };
    console.warn = function () {
      var args = [];
      for (var i = 0; i < arguments.length; i++) args.push(stringify(arguments[i]));
      logs.push({ type: "warn", args: args });
    };
    console.error = function () {
      var args = [];
      for (var i = 0; i < arguments.length; i++) args.push(stringify(arguments[i]));
      logs.push({ type: "error", args: args });
    };

    // 3-second timeout guard
    var timer = setTimeout(function () {
      timedOut = true;
      self.postMessage({ id: id, logs: logs, result: undefined, error: undefined, timedOut: true });
      self.close();
    }, timeout);

    try {
      // Shadow forbidden globals so user code cannot access them
      var fn = new Function(
        "window", "document", "localStorage", "fetch", "XMLHttpRequest",
        '"use strict";\\n' + code + "\\n"
      );
      result = fn(undefined, undefined, undefined, undefined, undefined);
      if (result !== undefined) {
        result = stringify(result);
      }
    } catch (err) {
      error = { name: err.name || "Error", message: err.message || String(err) };
    }

    clearTimeout(timer);

    // Restore console
    console.log = _log;
    console.warn = _warn;
    console.error = _error;

    if (!timedOut) {
      self.postMessage({ id: id, logs: logs, result: result, error: error, timedOut: false });
    }
  };
`;

/**
 * Creates a sandboxed Web Worker from an inline Blob URL.
 * Returns the Worker instance, or null if Blob Workers are unsupported.
 */
export function createSandboxWorker() {
  try {
    var blob = new Blob([workerScript], { type: "application/javascript" });
    var url = URL.createObjectURL(blob);
    var worker = new Worker(url);
    // Revoke the Blob URL after the worker is created — it's already loaded
    URL.revokeObjectURL(url);
    return worker;
  } catch (_) {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  CodeMirror CDN Loading + Fallback                                 */
/* ------------------------------------------------------------------ */

/**
 * Dynamically imports CodeMirror 6 modules from esm.sh CDN.
 * Returns an object with all needed CM exports, or null on failure.
 * On failure, prepends a fallback notice to each .code-block element.
 */
export async function loadCodeMirror() {
  try {
    const [
      stateModule,
      viewModule,
      langJsModule,
      languageModule,
      commandsModule,
      themeModule
    ] = await Promise.all([
      import("https://esm.sh/@codemirror/state"),
      import("https://esm.sh/@codemirror/view"),
      import("https://esm.sh/@codemirror/lang-javascript"),
      import("https://esm.sh/@codemirror/language"),
      import("https://esm.sh/@codemirror/commands"),
      import("https://esm.sh/@codemirror/theme-one-dark")
    ]);

    return {
      EditorState: stateModule.EditorState,
      EditorView: viewModule.EditorView,
      keymap: viewModule.keymap,
      lineNumbers: viewModule.lineNumbers,
      highlightActiveLine: viewModule.highlightActiveLine,
      javascript: langJsModule.javascript,
      bracketMatching: languageModule.bracketMatching,
      syntaxHighlighting: languageModule.syntaxHighlighting,
      defaultKeymap: commandsModule.defaultKeymap,
      indentWithTab: commandsModule.indentWithTab,
      oneDark: themeModule.oneDark
    };
  } catch (_) {
    // CDN failed — show fallback notice on each .code-block
    var codeBlocks = document.querySelectorAll(".code-block");
    codeBlocks.forEach(function (block) {
      var notice = document.createElement("div");
      notice.className = "playground-fallback-notice";
      notice.textContent =
        "Interactive editor unavailable \u2014 showing static code";
      block.parentNode.insertBefore(notice, block);
    });
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Playground Widget                                                  */
/* ------------------------------------------------------------------ */

/**
 * Creates a single interactive playground widget, replacing the original
 * .code-block element with a CodeMirror editor, toolbar, and console panel.
 *
 * @param {HTMLElement} container — the original .code-block element to replace
 * @param {string} code — the original text content (JavaScript source)
 * @param {object} cm — CodeMirror modules returned by loadCodeMirror()
 * @param {{ current: Worker|null }} workerRef — mutable wrapper holding the shared sandbox worker (allows replacement on timeout)
 * @returns {{ editor: EditorView, run: Function, reset: Function, destroy: Function }}
 */
export function createPlayground(container, code, cm, workerRef) {
  var originalCode = code;

  // ── Build DOM structure ──
  var playgroundContainer = document.createElement("div");
  playgroundContainer.className = "playground-container";

  // Header
  var header = document.createElement("div");
  header.className = "playground-header";
  var langSpan = document.createElement("span");
  langSpan.className = "lang";
  langSpan.textContent = "JavaScript";
  header.appendChild(langSpan);

  // Editor mount point
  var editorDiv = document.createElement("div");
  editorDiv.className = "playground-editor";

  // Toolbar
  var toolbar = document.createElement("div");
  toolbar.className = "playground-toolbar";

  // Run button
  var runBtn = document.createElement("button");
  runBtn.className = "playground-run-btn";
  runBtn.type = "button";
  var runIcon = document.createElement("span");
  runIcon.className = "btn-icon";
  runIcon.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 1.5L10 6L2.5 10.5V1.5Z" fill="currentColor"/></svg>';
  var runLabel = document.createElement("span");
  runLabel.className = "btn-label";
  runLabel.textContent = "Run";
  runBtn.appendChild(runIcon);
  runBtn.appendChild(runLabel);

  // Reset button
  var resetBtn = document.createElement("button");
  resetBtn.className = "playground-reset-btn";
  resetBtn.type = "button";
  var resetIcon = document.createElement("span");
  resetIcon.className = "btn-icon";
  resetIcon.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 1.5V4.5H4.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.1 7.5A4.5 4.5 0 1 0 3 3L1.5 4.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var resetLabel = document.createElement("span");
  resetLabel.className = "btn-label";
  resetLabel.textContent = "Reset";
  resetBtn.appendChild(resetIcon);
  resetBtn.appendChild(resetLabel);

  toolbar.appendChild(runBtn);
  toolbar.appendChild(resetBtn);

  // Console panel
  var consolePanel = document.createElement("div");
  consolePanel.className = "playground-console";
  var placeholder = document.createElement("span");
  placeholder.className = "placeholder";
  placeholder.textContent = "Click Run to see output";
  consolePanel.appendChild(placeholder);

  // Assemble
  playgroundContainer.appendChild(header);
  playgroundContainer.appendChild(editorDiv);
  playgroundContainer.appendChild(toolbar);
  playgroundContainer.appendChild(consolePanel);

  // Replace the original .code-block in the DOM
  container.parentNode.replaceChild(playgroundContainer, container);

  // ── CodeMirror setup ──
  var customTheme = cm.EditorView.theme({
    "&": {
      backgroundColor: "var(--surface2)",
      fontFamily: "'Space Mono', monospace"
    },
    ".cm-content": {
      fontFamily: "'Space Mono', monospace",
      fontSize: "0.88rem",
      lineHeight: "1.7"
    },
    ".cm-gutters": {
      backgroundColor: "var(--surface2)",
      borderRight: "1px solid var(--border)",
      color: "var(--text-dim)"
    },
    ".cm-activeLineGutter": {
      backgroundColor: "rgba(0, 102, 255, 0.06)"
    },
    ".cm-activeLine": {
      backgroundColor: "rgba(0, 102, 255, 0.04)"
    },
    "&.cm-focused": {
      outline: "none"
    },
    ".cm-scroller": {
      minHeight: "120px",
      maxHeight: "400px",
      overflow: "auto"
    }
  });

  var editor = new cm.EditorView({
    state: cm.EditorState.create({
      doc: originalCode,
      extensions: [
        cm.javascript(),
        cm.lineNumbers(),
        cm.bracketMatching(),
        cm.highlightActiveLine(),
        cm.keymap.of([{ key: "Ctrl-Enter", mac: "Cmd-Enter", run: function () { run(); return true; } }]),
        cm.keymap.of([cm.indentWithTab, ...cm.defaultKeymap]),
        customTheme
      ]
    }),
    parent: editorDiv
  });

  // ── Run handler ──
  var isRunning = false;

  function renderConsoleOutput(data) {
    consolePanel.innerHTML = "";

    // Render log entries
    if (data.logs && data.logs.length > 0) {
      data.logs.forEach(function (entry) {
        var el = document.createElement("div");
        el.className = "console-" + entry.type;
        el.textContent = entry.args.join(" ");
        consolePanel.appendChild(el);
      });
    }

    // Render return value
    if (data.result !== undefined && data.result !== null) {
      var resultEl = document.createElement("div");
      resultEl.className = "console-result";
      resultEl.textContent = "\u2192 " + data.result;
      consolePanel.appendChild(resultEl);
    }

    // Render error
    if (data.error) {
      var errorEl = document.createElement("div");
      errorEl.className = "console-error";
      errorEl.textContent = data.error.name + ": " + data.error.message;
      consolePanel.appendChild(errorEl);
    }

    // Render timeout
    if (data.timedOut) {
      var timeoutEl = document.createElement("div");
      timeoutEl.className = "console-error";
      timeoutEl.textContent = "Execution timed out (3s limit)";
      consolePanel.appendChild(timeoutEl);
    }
  }

  function run() {
    if (isRunning || !workerRef.current) return;

    isRunning = true;
    var runId = Date.now() + "-" + Math.random();

    // Clear console and show loading state
    consolePanel.innerHTML = "";
    runBtn.classList.add("running");
    runBtn.disabled = true;

    // Set up one-time message handler
    workerRef.current.onmessage = function (e) {
      var data = e.data;
      if (data.id !== runId) return;

      if (data.timedOut) {
        // Terminate the timed-out worker and create a fresh one
        workerRef.current.terminate();
        workerRef.current = createSandboxWorker();
      }

      renderConsoleOutput(data);

      // Re-enable button
      runBtn.classList.remove("running");
      runBtn.disabled = false;
      isRunning = false;
    };

    // Send code to worker
    workerRef.current.postMessage({ id: runId, code: editor.state.doc.toString(), timeout: 3000 });
  }

  // ── Reset handler ──
  function reset() {
    editor.dispatch({
      changes: { from: 0, to: editor.state.doc.length, insert: originalCode }
    });
  }

  function destroy() {
    editor.destroy();
  }

  // Wire button event listeners
  runBtn.addEventListener("click", run);
  resetBtn.addEventListener("click", reset);

  return { editor: editor, run: run, reset: reset, destroy: destroy };
}

/* ------------------------------------------------------------------ */
/*  Initialization                                                     */
/* ------------------------------------------------------------------ */

/**
 * Entry point — called on DOMContentLoaded.
 * Loads CodeMirror from CDN, creates the shared sandbox worker,
 * and replaces every .code-block with an interactive playground.
 */
async function initPlaygrounds() {
  // Load CodeMirror modules from CDN (returns null on failure)
  var cm = await loadCodeMirror();
  if (!cm) return; // fallback notice already shown by loadCodeMirror

  // Create the shared sandbox worker (returns null if Blob URL unsupported)
  var worker = createSandboxWorker();
  var workerRef = { current: worker };

  // Snapshot all .code-block elements before we start replacing them
  var codeBlocks = Array.from(document.querySelectorAll(".code-block"));

  // Replace each static code block with an interactive playground
  codeBlocks.forEach(function (el) {
    var code = el.textContent.trim();
    createPlayground(el, code, cm, workerRef);
  });

  // If worker creation failed, disable all Run buttons and show a notice
  if (!worker) {
    var runBtns = document.querySelectorAll(".playground-run-btn");
    runBtns.forEach(function (btn) {
      btn.disabled = true;
      btn.title = "Code execution unavailable in this browser";
    });

    // Show a notice in each console panel
    var consolePanels = document.querySelectorAll(".playground-console");
    consolePanels.forEach(function (panel) {
      panel.innerHTML = "";
      var notice = document.createElement("div");
      notice.className = "console-error";
      notice.textContent = "Code execution unavailable in this browser";
      panel.appendChild(notice);
    });
  }
}

document.addEventListener("DOMContentLoaded", initPlaygrounds);
