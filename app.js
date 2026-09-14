/**
 * Windows 11 Fluent Sticky Notes Application
 * Edge-Docked Quick Notes with Acrylic Glassmorphism & Fluent Micro-interactions
 */

(() => {
  'use strict';

  // --- Initial Seed Data (Interactive Tutorials for Fluent Notes) ---
  const DEFAULT_NOTES = [
    {
      id: "tutorial-welcome",
      title: "Welcome to Fluent Notes ✨",
      content: "Windows 11 Fluent Design edge-docked sticky notes!\n\n[x] Hover over any edge tab to peek preview\n[x] Click any tab to open rich-text editor\n[ ] Drag dock up/down using top grip ::: handle\n[ ] Discover shortcuts and customize colors!",
      color: "blue",
      tag: "guide",
      isFavorite: true,
      isPinned: false,
      pinnedPos: { x: 200, y: 150 },
      fontStyle: "clean",
      updatedAt: 1789322191000
    },
    {
      id: "tutorial-hotkeys",
      title: "Shortcuts & Hotkeys ⚡",
      content: "Boost your productivity with quick actions:\n\n• Ctrl + Alt + N : Create new sticky note\n• Ctrl + Alt + H : Tuck / Collapse dock to screen bezel\n• Click [ ⇄ ] : Switch dock between Left & Right edges\n• Double-click ::: grip handle to re-center vertically",
      color: "yellow",
      tag: "shortcuts",
      isFavorite: false,
      isPinned: false,
      pinnedPos: { x: 220, y: 170 },
      fontStyle: "clean",
      updatedAt: 1789322180000
    },
    {
      id: "tutorial-features",
      title: "Rich Text & Checklists 📝",
      content: "Everything you need for daily workflow:\n\n[x] Rich text formatting: Bold, Italic, Lists\n[x] Interactive task checklists with [ ] checkboxes\n[ ] Vibrant Fluent pastel colors (Yellow, Blue, Mint, Lavender, Peach, Slate)\n[ ] Fast search & tag filtering in dock header",
      color: "lavender",
      tag: "features",
      isFavorite: false,
      isPinned: false,
      pinnedPos: { x: 240, y: 190 },
      fontStyle: "clean",
      updatedAt: 1789322170000
    },
    {
      id: "tutorial-privacy",
      title: "100% Local & Private 🔒",
      content: "Your notes never leave your computer:\n\n• Fully offline desktop application\n• Automatically saved locally in %APPDATA%\\StickyNotes\n• Zero tracking, zero telemetry, zero cloud lock-in\n• Real-time backup protection",
      color: "mint",
      tag: "privacy",
      isFavorite: false,
      isPinned: false,
      pinnedPos: { x: 260, y: 210 },
      fontStyle: "clean",
      updatedAt: 1789322160000
    }
  ];

  // --- State ---
  let notes = [];
  let currentEditingId = null;
  let activePeekId = null;
  let peekHideTimeout = null;
  let isSoundEnabled = localStorage.getItem('win11_sticky_sound_enabled') === 'true'; // Default is false (MUTED)
  let isDiskReady = false;
  let audioCtx = null;
  let searchQuery = '';
  let currentTagFilter = 'all';
  let keyboardNavIndex = -1;

  // --- DOM Elements ---
  const winEdgeDock = document.getElementById('win-edge-dock');
  const dockTabList = document.getElementById('dock-tab-list');
  const edgeStackIndicator = document.getElementById('edge-stack-indicator');
  const btnAddNote = document.getElementById('btn-add-note');
  const peekCard = document.getElementById('peek-card');
  const peekCardInner = document.getElementById('peek-card-inner');
  const peekTitle = document.getElementById('peek-title');
  const peekCategoryTag = document.getElementById('peek-category-tag');
  const peekBody = document.getElementById('peek-body');
  const peekTimestamp = document.getElementById('peek-timestamp');
  const btnPeekPin = document.getElementById('btn-peek-pin');
  const btnPeekEdit = document.getElementById('btn-peek-edit');
  const btnPeekDelete = document.getElementById('btn-peek-delete');

  const editorOverlay = document.getElementById('editor-overlay');
  const editorWindow = document.getElementById('editor-window');
  const noteTitleInput = document.getElementById('note-title-input');
  const noteTagSelect = document.getElementById('note-tag-select');
  const dockTagChips = document.getElementById('dock-tag-chips');
  const noteBodyInput = document.getElementById('note-body-input');
  const saveStatusIndicator = document.getElementById('save-status-indicator');
  const btnManualSaveBottom = document.getElementById('btn-manual-save-bottom');
  const editorSaveToast = document.getElementById('editor-save-toast');
  const editorSaveToastText = document.getElementById('editor-save-toast-text');
  const noteCharCount = document.getElementById('note-char-count');
  const btnFavoriteNote = document.getElementById('btn-favorite-note');
  const iconStarOutline = document.getElementById('icon-star-outline');
  const iconStarFilled = document.getElementById('icon-star-filled');
  const btnPinNote = document.getElementById('btn-pin-note');
  const btnCaptionMinimize = document.getElementById('btn-caption-minimize');
  const btnCaptionMaximize = document.getElementById('btn-caption-maximize');
  const btnCaptionClose = document.getElementById('btn-caption-close');
  const btnEditorSizePresets = document.getElementById('btn-editor-size-presets');
  const editorSizePopover = document.getElementById('editor-size-popover');
  const btnResetNoteSize = document.getElementById('btn-reset-note-size');
  const editorResizeGrip = document.getElementById('editor-resize-grip');
  const btnDeleteNote = document.getElementById('btn-delete-note');
  const btnCompleteNote = document.getElementById('btn-complete-note');
  const completeBtnText = document.getElementById('complete-btn-text');
  const btnCloseNote = document.getElementById('btn-close-note');
  const paletteSwatches = document.querySelectorAll('.palette-swatch');

  const btnFormatBold = document.getElementById('btn-format-bold');
  const btnFormatItalic = document.getElementById('btn-format-italic');
  const btnFormatUnderline = document.getElementById('btn-format-underline');
  const btnFormatStrike = document.getElementById('btn-format-strike');
  const btnFormatBullet = document.getElementById('btn-format-bullet');
  const btnFormatCheck = document.getElementById('btn-format-check');
  const btnFontStyle = document.getElementById('btn-font-style');
  const fontStyleLabel = document.getElementById('font-style-label');

  const pinnedNotesContainer = document.getElementById('pinned-notes-container');
  const instructionBadge = document.getElementById('instruction-badge');
  const btnDismissBadge = document.getElementById('btn-dismiss-badge');

  const notesSearchInput = document.getElementById('notes-search-input');
  const notesCountBadge = document.getElementById('notes-count-badge');
  const btnThemeToggle = document.getElementById('btn-theme-toggle');
  const iconThemeDark = document.getElementById('icon-theme-dark');
  const iconThemeLight = document.getElementById('icon-theme-light');
  const btnWallpaperToggle = document.getElementById('btn-wallpaper-toggle');
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const iconSoundOn = document.getElementById('icon-sound-on');
  const iconSoundOff = document.getElementById('icon-sound-off');
  const btnDockSound = document.getElementById('btn-dock-sound');
  const dockIconSoundOff = document.getElementById('dock-icon-sound-off');
  const dockIconSoundOn = document.getElementById('dock-icon-sound-on');
  const btnEditorSoundToggle = document.getElementById('btn-editor-sound-toggle');
  const editorIconSoundOff = document.getElementById('editor-icon-sound-off');
  const editorIconSoundOn = document.getElementById('editor-icon-sound-on');
  const btnResetDemo = document.getElementById('btn-reset-demo');

  const clockTime = document.getElementById('clock-time');
  const clockDate = document.getElementById('clock-date');
  const trayNoteCount = document.getElementById('tray-note-count');
  const taskbarStickyApp = document.getElementById('taskbar-sticky-app');

  // --- Edge Dock Positioning & Collapse Management ---
  let currentDockSide = localStorage.getItem('win11_sticky_dock_side') || 'right';
  const btnToggleDockSide = document.getElementById('btn-toggle-dock-side');
  const dockGripHandle = document.getElementById('dock-grip-handle');
  const btnDockCollapse = document.getElementById('btn-dock-collapse');
  const dockExpandPill = document.getElementById('dock-expand-pill');
  const dockCollapseIcon = document.getElementById('dock-collapse-icon');
  const expandPillIcon = document.getElementById('expand-pill-icon');
  let isDockCollapsed = false;

  function applyDockSide(side) {
    currentDockSide = side;
    localStorage.setItem('win11_sticky_dock_side', side);
    document.body.classList.remove('dock-side-left', 'dock-side-right');
    document.body.classList.add(`dock-side-${side}`);
    if (winEdgeDock) {
      winEdgeDock.classList.remove('dock-left', 'dock-right');
      winEdgeDock.classList.add(`dock-${side}`);
      if (side === 'left') {
        winEdgeDock.style.setProperty('left', '0px', 'important');
        winEdgeDock.style.setProperty('right', 'auto', 'important');
        winEdgeDock.style.setProperty('align-items', 'flex-start', 'important');
      } else {
        winEdgeDock.style.setProperty('right', '0px', 'important');
        winEdgeDock.style.setProperty('left', 'auto', 'important');
        winEdgeDock.style.setProperty('align-items', 'flex-end', 'important');
      }
    }
    if (dockExpandPill) {
      dockExpandPill.classList.remove('dock-left', 'dock-right');
      dockExpandPill.classList.add(`dock-${side}`);
      if (side === 'left') {
        dockExpandPill.style.setProperty('left', '0px', 'important');
        dockExpandPill.style.setProperty('right', 'auto', 'important');
      } else {
        dockExpandPill.style.setProperty('right', '0px', 'important');
        dockExpandPill.style.setProperty('left', 'auto', 'important');
      }
    }
    if (btnToggleDockSide) {
      btnToggleDockSide.title = side === 'left' ? 'Move Dock to Right Edge' : 'Move Dock to Left Edge';
    }
    if (dockCollapseIcon) {
      dockCollapseIcon.innerHTML = side === 'left'
        ? '<polyline points="15 18 9 12 15 6"></polyline>'
        : '<polyline points="9 18 15 12 9 6"></polyline>';
    }
    if (expandPillIcon) {
      expandPillIcon.innerHTML = side === 'left'
        ? '<polyline points="9 18 15 12 9 6"></polyline>'
        : '<polyline points="15 18 9 12 15 6"></polyline>';
    }
  }

  function collapseDock() {
    isDockCollapsed = true;
    winEdgeDock.classList.add('collapsed');
    winEdgeDock.style.transform = '';
    hidePeekCard();
    if (dockExpandPill) dockExpandPill.classList.remove('hidden');
    if (window.electronAPI && window.electronAPI.isElectron) {
      // Free the entire region behind the dock for 100% click-through access!
      window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
    }
    appState.isDockCollapsed = true;
    saveAppState();
    playFluentSound('click');
  }

  function expandDock() {
    isDockCollapsed = false;
    winEdgeDock.classList.remove('collapsed');
    if (appState.dockTop) {
      winEdgeDock.style.transform = 'none';
    } else {
      winEdgeDock.style.transform = '';
    }
    if (dockExpandPill) dockExpandPill.classList.add('hidden');
    if (window.electronAPI && window.electronAPI.isElectron) {
      window.electronAPI.setIgnoreMouseEvents(false);
    }
    appState.isDockCollapsed = false;
    saveAppState();
    playFluentSound('click');
  }

  function toggleDockCollapse() {
    if (isDockCollapsed) {
      expandDock();
    } else {
      collapseDock();
    }
  }

  // Vertical dragging of the edge dock
  let isDraggingDock = false;
  let dockDragStartY = 0;
  let dockInitialTop = 0;

  if (dockGripHandle) {
    dockGripHandle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      isDraggingDock = true;
      dockDragStartY = e.clientY;
      const rect = winEdgeDock.getBoundingClientRect();
      dockInitialTop = rect.top;
      document.body.style.userSelect = 'none';
    });

    // Double-click grip handle to reset to vertical center
    dockGripHandle.addEventListener('dblclick', (e) => {
      e.preventDefault();
      e.stopPropagation();
      winEdgeDock.style.top = '50%';
      winEdgeDock.style.transform = 'translateY(-50%)';
      winEdgeDock.classList.remove('is-custom-top');
      appState.dockTop = null;
      saveAppState();
      playFluentSound('click');
    });
  }

  window.addEventListener('mousemove', (e) => {
    if (!isDraggingDock) return;
    e.preventDefault();
    const deltaY = e.clientY - dockDragStartY;
    let newTop = dockInitialTop + deltaY;
    const minTop = 10;
    const maxTop = Math.max(10, window.innerHeight - winEdgeDock.offsetHeight - 10);
    newTop = Math.max(minTop, Math.min(newTop, maxTop));

    winEdgeDock.style.top = `${newTop}px`;
    winEdgeDock.style.transform = 'none';
    winEdgeDock.classList.add('is-custom-top');
  });

  window.addEventListener('mouseup', () => {
    if (!isDraggingDock) return;
    isDraggingDock = false;
    document.body.style.userSelect = '';
    const rect = winEdgeDock.getBoundingClientRect();
    appState.dockTop = Math.round(rect.top);
    saveAppState();
  });

  const dockHeader = document.getElementById('dock-header');
  if (dockHeader) {
    dockHeader.addEventListener('mouseenter', () => {
      if (window.electronAPI && window.electronAPI.isElectron) {
        window.electronAPI.setIgnoreMouseEvents(false);
      }
    });
  }

  if (btnDockCollapse) {
    btnDockCollapse.addEventListener('mouseenter', () => {
      if (window.electronAPI && window.electronAPI.isElectron) {
        window.electronAPI.setIgnoreMouseEvents(false);
      }
    });
    btnDockCollapse.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
    });
    btnDockCollapse.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      collapseDock();
    });
  }

  if (dockExpandPill) {
    dockExpandPill.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
    });
    dockExpandPill.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      expandDock();
    });
    dockExpandPill.addEventListener('mouseenter', () => {
      if (window.electronAPI && window.electronAPI.isElectron) {
        window.electronAPI.setIgnoreMouseEvents(false);
      }
    });
    dockExpandPill.addEventListener('mouseleave', () => {
      if (isDockCollapsed && editorOverlay.classList.contains('hidden')) {
        if (window.electronAPI && window.electronAPI.isElectron) {
          window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
        }
      }
    });
  }

  if (btnToggleDockSide) {
    btnToggleDockSide.addEventListener('click', (e) => {
      e.stopPropagation();
      const newSide = currentDockSide === 'right' ? 'left' : 'right';
      applyDockSide(newSide);
      appState.dockSide = newSide;
      saveAppState();
      playFluentSound('click');
      showEditorSaveToast(newSide === 'left' ? '⇄ Dock moved to Left Edge' : '⇄ Dock moved to Right Edge');
    });
  }

  // Global hotkey Ctrl + Alt + H to toggle dock collapse/expand
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === 'h' || e.key === 'H')) {
      e.preventDefault();
      toggleDockCollapse();
    }
  });

  function expandNativeWindow() {
    if (isNativeWidget && window.pywebview && window.pywebview.api && window.pywebview.api.expand_from_edge) {
      window.pywebview.api.expand_from_edge(currentDockSide);
    }
  }

  function collapseNativeWindow() {
    if (editorOverlay.classList.contains('hidden')) {
      if (isNativeWidget && window.pywebview && window.pywebview.api && window.pywebview.api.dock_to_edge) {
        window.pywebview.api.dock_to_edge(currentDockSide);
      }
    }
  }

  // --- Sound Effects (Synthesized via Web Audio API - Zero External Dependencies) ---
  function playFluentSound(type = 'click') {
    if (!isSoundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'peek') {
        // Subtle slide whoosh
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.08);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'click') {
        // Windows subtle button tap
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(350, now + 0.04);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'save') {
        // Crisp chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'delete') {
        // Low soft thud
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.1);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch (e) {
      // Audio context might be restricted before first gesture
    }
  }

  // Update UI indicators for mute/sound toggles
  function updateSoundUI() {
    const titleText = isSoundEnabled ? 'Sound is On (Click to Mute)' : 'Sound Muted (Click to Unmute)';

    if (btnDockSound) btnDockSound.title = titleText;
    if (dockIconSoundOff) dockIconSoundOff.classList.toggle('hidden', isSoundEnabled);
    if (dockIconSoundOn) dockIconSoundOn.classList.toggle('hidden', !isSoundEnabled);

    if (btnEditorSoundToggle) btnEditorSoundToggle.title = titleText;
    if (editorIconSoundOff) editorIconSoundOff.classList.toggle('hidden', isSoundEnabled);
    if (editorIconSoundOn) editorIconSoundOn.classList.toggle('hidden', !isSoundEnabled);

    if (btnSoundToggle) btnSoundToggle.title = titleText;
    if (iconSoundOn) iconSoundOn.classList.toggle('hidden', !isSoundEnabled);
    if (iconSoundOff) iconSoundOff.classList.toggle('hidden', isSoundEnabled);
  }

  function toggleSound(force) {
    if (typeof force === 'boolean') {
      isSoundEnabled = force;
    } else {
      isSoundEnabled = !isSoundEnabled;
    }
    localStorage.setItem('win11_sticky_sound_enabled', isSoundEnabled ? 'true' : 'false');
    updateSoundUI();
    if (isSoundEnabled) {
      playFluentSound('click');
    }
  }

  // --- App Session State (Ensures user returns to the exact same state after restart) ---
  let appState = {
    activeNoteId: null,
    editorPos: null,
    editorSize: null,
    isMaximized: false,
    scrollPos: 0,
    dockSide: currentDockSide,
    dockTop: null,
    isDockCollapsed: false,
    isSoundEnabled: isSoundEnabled,
    currentTagFilter: 'all'
  };

  function saveAppState() {
    try {
      appState.activeNoteId = currentEditingId;
      appState.dockSide = currentDockSide;
      appState.isDockCollapsed = isDockCollapsed;
      appState.isSoundEnabled = isSoundEnabled;
      appState.currentTagFilter = currentTagFilter;
      if (noteBodyInput) {
        appState.scrollPos = noteBodyInput.scrollTop;
      }
      const jsonStr = JSON.stringify(appState);
      localStorage.setItem('win11_sticky_app_state', jsonStr);
      if (window.electronAPI && window.electronAPI.saveStateToDisk) {
        window.electronAPI.saveStateToDisk(jsonStr);
      }
    } catch (e) {
      console.error('Failed to persist app state:', e);
    }
  }

  function loadAppState() {
    try {
      const stored = localStorage.getItem('win11_sticky_app_state');
      if (stored) {
        appState = { ...appState, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to load local app state', e);
    }
  }

  let sessionRestored = false;

  function restorePreviousSession() {
    if (sessionRestored) return;
    sessionRestored = true;

    // 1. Restore sound setting
    if (typeof appState.isSoundEnabled === 'boolean') {
      isSoundEnabled = appState.isSoundEnabled;
      updateSoundUI();
    }

    // 2. Restore dock side
    if (appState.dockSide) {
      applyDockSide(appState.dockSide);
    } else {
      applyDockSide('right');
    }

    // 2b. Restore dock vertical position
    if (typeof appState.dockTop === 'number') {
      const minTop = 10;
      const maxTop = Math.max(10, window.innerHeight - winEdgeDock.offsetHeight - 10);
      const topVal = Math.max(minTop, Math.min(appState.dockTop, maxTop));
      winEdgeDock.style.top = `${topVal}px`;
      winEdgeDock.style.transform = 'none';
      winEdgeDock.classList.add('is-custom-top');
    }

    // 2c. Restore collapsed state if user had collapsed it
    if (appState.isDockCollapsed) {
      collapseDock();
    }

    // 3. Restore tag filter
    if (appState.currentTagFilter && dockTagChips) {
      currentTagFilter = appState.currentTagFilter;
      dockTagChips.querySelectorAll('.tag-chip').forEach(chip => {
        if (chip.dataset.tag === currentTagFilter) {
          chip.classList.add('active');
        } else {
          chip.classList.remove('active');
        }
      });
      renderDockTabs();
    }

    // 4. Restore editor window position if user had moved it
    if (appState.editorPos && typeof appState.editorPos.x === 'number' && typeof appState.editorPos.y === 'number') {
      const maxX = Math.max(50, window.innerWidth - 100);
      const maxY = Math.max(50, window.innerHeight - 100);
      const posX = Math.min(Math.max(10, appState.editorPos.x), maxX);
      const posY = Math.min(Math.max(10, appState.editorPos.y), maxY);

      editorWindow.classList.add('is-positioned');
      editorWindow.style.position = 'fixed';
      editorWindow.style.left = `${posX}px`;
      editorWindow.style.top = `${posY}px`;
      editorWindow.style.margin = '0';
      editorWindow.style.transform = 'none';
    }

    // 5. Restore custom size or maximized size
    if (appState.editorSize && typeof appState.editorSize.width === 'number' && typeof appState.editorSize.height === 'number') {
      editorWindow.style.width = `${appState.editorSize.width}px`;
      editorWindow.style.height = `${appState.editorSize.height}px`;
    }
    if (appState.isMaximized) {
      isMaximized = true;
      const maxW = Math.min(920, window.innerWidth - 40);
      const maxH = Math.min(720, window.innerHeight - 60);
      editorWindow.style.width = `${maxW}px`;
      editorWindow.style.height = `${maxH}px`;
    }

    // 6. RESTORE ACTIVE NOTE: If a note was open when quitting/restarting, reopen it immediately!
    if (appState.activeNoteId) {
      const noteToOpen = notes.find(n => n.id === appState.activeNoteId);
      if (noteToOpen) {
        openNoteEditor(noteToOpen.id);
        if (appState.scrollPos && noteBodyInput) {
          setTimeout(() => {
            noteBodyInput.scrollTop = appState.scrollPos;
          }, 80);
        }
      }
    }
  }

  // --- Storage Helpers ---
  function loadNotes() {
    loadAppState();
    try {
      const stored = localStorage.getItem('win11_sticky_notes_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          notes = parsed;
        } else {
          notes = JSON.parse(JSON.stringify(DEFAULT_NOTES));
        }
      } else {
        notes = JSON.parse(JSON.stringify(DEFAULT_NOTES));
      }
    } catch (e) {
      console.warn('Failed to load local notes, using defaults', e);
      notes = JSON.parse(JSON.stringify(DEFAULT_NOTES));
    }
    syncWithDiskApi();
  }

  function syncWithDiskApi() {
    // Electron environment: fetch persisted notes and state directly from disk
    if (window.electronAPI && window.electronAPI.getNotesFromDisk) {
      window.electronAPI.getNotesFromDisk().then(diskData => {
        if (diskData) {
          try {
            const parsed = JSON.parse(diskData);
            if (Array.isArray(parsed) && parsed.length > 0) {
              notes = parsed;
              localStorage.setItem('win11_sticky_notes_data', diskData);
              renderDockTabs();
            }
          } catch (e) {
            console.error('Failed to parse notes from disk:', e);
          }
        }
        isDiskReady = true;

        // Fetch state from disk
        if (window.electronAPI.getStateFromDisk) {
          window.electronAPI.getStateFromDisk().then(diskState => {
            if (diskState) {
              try {
                const parsedState = JSON.parse(diskState);
                if (parsedState && typeof parsedState === 'object') {
                  appState = { ...appState, ...parsedState };
                  localStorage.setItem('win11_sticky_app_state', diskState);
                }
              } catch (e) {
                console.error('Failed to parse state from disk:', e);
              }
            }
            restorePreviousSession();
          }).catch(() => restorePreviousSession());
        } else {
          restorePreviousSession();
        }
      }).catch(err => {
        console.warn('Disk sync error:', err);
        isDiskReady = true;
        restorePreviousSession();
      });
      return;
    }

    if (window.pywebview && window.pywebview.api && window.pywebview.api.get_notes) {
      window.pywebview.api.get_notes().then(diskData => {
        if (diskData) {
          try {
            const parsed = JSON.parse(diskData);
            if (Array.isArray(parsed) && parsed.length > 0) {
              notes = parsed;
              localStorage.setItem('win11_sticky_notes_data', diskData);
              renderDockTabs();
            }
          } catch (err) {
            console.error('Failed to parse notes from disk:', err);
          }
        }
        isDiskReady = true;
        restorePreviousSession();
      }).catch(err => {
        console.warn('Disk sync error:', err);
        isDiskReady = true;
        restorePreviousSession();
      });
      return;
    }

    // Browser fallback
    isDiskReady = true;
    restorePreviousSession();
  }

  window.addEventListener('pywebviewready', () => {
    syncWithDiskApi();
  });

  function saveNotes() {
    try {
      const jsonStr = JSON.stringify(notes);
      localStorage.setItem('win11_sticky_notes_data', jsonStr);

      // SAFETY GUARD: NEVER write to physical disk before disk read is complete!
      if (!isDiskReady) {
        console.warn('Suppressing save to disk because disk sync is not ready yet');
        return;
      }

      // Persist directly to physical notes.json on disk via Electron IPC
      if (window.electronAPI && window.electronAPI.saveNotesToDisk) {
        window.electronAPI.saveNotesToDisk(jsonStr);
      } else if (window.pywebview && window.pywebview.api && window.pywebview.api.save_notes) {
        window.pywebview.api.save_notes(jsonStr);
      }
    } catch (e) {
      console.error('Failed to persist notes to storage', e);
    }
  }

  // --- Format Relative Time ---
  function formatRelativeTime(timestamp) {
    const diff = Date.now() - timestamp;
    if (diff < 1000 * 60) return 'Saved · just now';
    if (diff < 1000 * 60 * 60) {
      const mins = Math.floor(diff / (1000 * 60));
      return `Updated ${mins}m ago`;
    }
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    return `Updated ${hrs}h ago`;
  }

  // --- Render Functions ---

  function getVisibleNotes() {
    return notes.filter(n => {
      const matchesSearch = !searchQuery || (
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const matchesTag = (currentTagFilter === 'all' || !currentTagFilter) ? true : (n.tag === currentTagFilter);
      return matchesSearch && matchesTag;
    });
  }

  // 1. Render Edge Docked Tabs
  function renderDockTabs() {
    dockTabList.innerHTML = '';
    edgeStackIndicator.innerHTML = '';

    const filtered = getVisibleNotes();

    notesCountBadge.textContent = filtered.length;
    trayNoteCount.textContent = notes.length;

    filtered.forEach((note, index) => {
      // Create Dock Tab
      const tab = document.createElement('div');
      tab.className = `dock-tab-item theme-note-${note.color}`;
      tab.dataset.id = note.id;
      tab.setAttribute('aria-label', `${note.title}${note.tag && note.tag !== 'none' ? ' [' + note.tag.toUpperCase() + ']' : ''}`);

      if (keyboardNavIndex === index) {
        tab.classList.add('keyboard-focus');
      }

      if (note.isFavorite) {
        const star = document.createElement('div');
        star.className = 'dock-tab-favorite-dot';
        tab.appendChild(star);
      }

      if (note.tag && note.tag !== 'none') {
        const tagDot = document.createElement('div');
        tagDot.className = `dock-tab-tag-indicator ${note.tag}`;
        tab.appendChild(tagDot);
      }

      const label = document.createElement('span');
      label.className = 'dock-tab-label';
      // Truncate title for vertical presentation
      label.textContent = note.title.length > 9 ? note.title.slice(0, 8) + '..' : note.title;
      tab.appendChild(label);

      // Event listeners for hover slide-out peek
      tab.addEventListener('mouseenter', (e) => {
        keyboardNavIndex = index;
        document.querySelectorAll('.dock-tab-item').forEach(t => t.classList.remove('keyboard-focus'));
        handleTabMouseEnter(note, tab);
      });

      tab.addEventListener('mouseleave', () => {
        handleTabMouseLeave();
      });

      tab.addEventListener('click', () => {
        playFluentSound('click');
        hidePeekCard();
        openNoteEditor(note.id);
      });

      // HTML5 Drag & Drop Tab Reordering
      tab.setAttribute('draggable', 'true');
      tab.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', note.id);
        tab.classList.add('dragging');
      });

      tab.addEventListener('dragend', () => {
        tab.classList.remove('dragging');
      });

      tab.addEventListener('dragover', (e) => {
        e.preventDefault();
        tab.classList.add('drag-over');
      });

      tab.addEventListener('dragleave', () => {
        tab.classList.remove('drag-over');
      });

      tab.addEventListener('drop', (e) => {
        e.preventDefault();
        tab.classList.remove('drag-over');
        const sourceId = e.dataTransfer.getData('text/plain');
        if (!sourceId || sourceId === note.id) return;

        const fromIdx = notes.findIndex(n => n.id === sourceId);
        const toIdx = notes.findIndex(n => n.id === note.id);
        if (fromIdx !== -1 && toIdx !== -1) {
          const [moved] = notes.splice(fromIdx, 1);
          notes.splice(toIdx, 0, moved);
          saveNotes();
          renderDockTabs();
          playFluentSound('click');
        }
      });

      dockTabList.appendChild(tab);

      // Create Minimized Edge Indicator Dot
      const dot = document.createElement('div');
      dot.className = `indicator-dot theme-note-${note.color}`;
      edgeStackIndicator.appendChild(dot);
    });

    // Render Pinned notes
    renderPinnedNotes();
  }

  // 2. Render Pinned Desktop Notes
  function renderPinnedNotes() {
    pinnedNotesContainer.innerHTML = '';
    const pinned = notes.filter(n => n.isPinned);

    pinned.forEach(note => {
      const card = document.createElement('div');
      card.className = `pinned-note-card theme-note-${note.color}`;
      card.style.left = `${note.pinnedPos?.x || 100}px`;
      card.style.top = `${note.pinnedPos?.y || 100}px`;
      if (note.pinnedWidth && note.pinnedHeight) {
        card.style.width = `${note.pinnedWidth}px`;
        card.style.height = `${note.pinnedHeight}px`;
      }
      card.dataset.id = note.id;

      card.innerHTML = `
        <div class="pinned-note-header">
          <span class="pinned-note-title">${escapeHtml(note.title)}</span>
          <div class="pinned-note-actions">
            <button class="fluent-icon-btn small btn-unpin" title="Unpin to dock">📌</button>
            <button class="fluent-icon-btn small btn-open-edit" title="Edit">✎</button>
          </div>
        </div>
        <div class="pinned-note-content">${formatContentToHtml(note.content)}</div>
        <div class="pinned-resize-grip" title="Drag to resize pinned note">
          <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor">
            <circle cx="13" cy="13" r="1.3"/>
            <circle cx="9" cy="13" r="1.3"/>
            <circle cx="13" cy="9" r="1.3"/>
          </svg>
        </div>
      `;

      // Dragging functionality for desktop pinned notes
      setupNoteDrag(card, note);
      // Resizing functionality for desktop pinned notes
      setupPinnedNoteResize(card, note);

      card.querySelector('.btn-unpin').addEventListener('click', (e) => {
        e.stopPropagation();
        note.isPinned = false;
        saveNotes();
        renderPinnedNotes();
      });

      card.querySelector('.btn-open-edit').addEventListener('click', (e) => {
        e.stopPropagation();
        openNoteEditor(note.id);
      });

      pinnedNotesContainer.appendChild(card);
    });
  }

  // Simple Draggable Logic for Pinned Notes
  function setupNoteDrag(elem, note) {
    let isDragging = false;
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;

    elem.addEventListener('mousedown', (e) => {
      if (e.target.closest('button') || e.target.closest('.pinned-resize-grip')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialLeft = elem.offsetLeft;
      initialTop = elem.offsetTop;
      elem.style.zIndex = '20';

      const onMouseMove = (moveEvent) => {
        if (!isDragging) return;
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        const newX = Math.max(10, Math.min(window.innerWidth - 280, initialLeft + dx));
        const newY = Math.max(50, Math.min(window.innerHeight - 240, initialTop + dy));
        elem.style.left = `${newX}px`;
        elem.style.top = `${newY}px`;
        note.pinnedPos = { x: newX, y: newY };
      };

      const onMouseUp = () => {
        if (isDragging) {
          isDragging = false;
          saveNotes();
          elem.style.zIndex = '10';
        }
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  }

  // Resizing Logic for Pinned Notes
  function setupPinnedNoteResize(elem, note) {
    const grip = elem.querySelector('.pinned-resize-grip');
    if (!grip) return;

    grip.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();

      let startX = e.clientX;
      let startY = e.clientY;
      let startW = elem.offsetWidth;
      let startH = elem.offsetHeight;

      const onMouseMove = (moveEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        const newW = Math.max(200, Math.min(800, startW + dx));
        const newH = Math.max(140, Math.min(800, startH + dy));
        elem.style.width = `${newW}px`;
        elem.style.height = `${newH}px`;
        note.pinnedWidth = newW;
        note.pinnedHeight = newH;
      };

      const onMouseUp = () => {
        saveNotes();
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  }

  // --- Peek Card Slide-Out Logic ---
  function handleTabMouseEnter(note, tabElement) {
    clearTimeout(peekHideTimeout);
    activePeekId = note.id;

    // Calculate position relative to tab
    const rect = tabElement.getBoundingClientRect();
    const peekTop = Math.max(60, Math.min(window.innerHeight - 340, rect.top - 16));

    if (currentDockSide === 'left') {
      const peekLeft = Math.round(rect.right + 10);
      peekCard.style.top = `${peekTop}px`;
      peekCard.style.setProperty('left', `${peekLeft}px`, 'important');
      peekCard.style.setProperty('right', 'auto', 'important');
      peekCard.style.setProperty('transform-origin', 'left center', 'important');
    } else {
      const peekRight = Math.max(42, window.innerWidth - rect.left + 10);
      peekCard.style.top = `${peekTop}px`;
      peekCard.style.setProperty('right', `${peekRight}px`, 'important');
      peekCard.style.setProperty('left', 'auto', 'important');
      peekCard.style.setProperty('transform-origin', 'right center', 'important');
    }

    // Populate peek content
    peekCategoryTag.className = 'peek-category-badge';
    if (note.tag && note.tag !== 'none') {
      const tagLabels = {
        work: '💼 WORK',
        personal: '🏠 PERSONAL',
        urgent: '⚡ URGENT',
        ideas: '💡 IDEAS'
      };
      peekCategoryTag.textContent = tagLabels[note.tag] || note.tag.toUpperCase();
      peekCategoryTag.classList.add(`tag-badge-${note.tag}`);
    } else {
      peekCategoryTag.textContent = note.title.toUpperCase();
    }
    peekTitle.textContent = note.title;
    peekBody.innerHTML = formatContentToHtml(note.content);
    peekTimestamp.textContent = formatRelativeTime(note.updatedAt);

    // Apply color theme to peek card
    peekCardInner.className = `fluent-peek-card theme-note-${note.color}`;

    // Highlight current tab
    document.querySelectorAll('.dock-tab-item').forEach(t => t.classList.remove('active-peek'));
    tabElement.classList.add('active-peek');

    // Show with animation
    peekCard.classList.remove('hidden');
    playFluentSound('peek');
  }

  function handleTabMouseLeave() {
    peekHideTimeout = setTimeout(() => {
      hidePeekCard();
    }, 280); // slight grace period so user can move into peek card
  }

  function hidePeekCard() {
    peekCard.classList.add('hidden');
    document.querySelectorAll('.dock-tab-item').forEach(t => {
      t.classList.remove('active-peek');
      t.classList.remove('keyboard-focus');
    });
    activePeekId = null;
    keyboardNavIndex = -1;
    setTimeout(collapseNativeWindow, 150);
  }

  // Allow hover inside peek card without collapsing
  peekCard.addEventListener('mouseenter', () => {
    clearTimeout(peekHideTimeout);
  });

  peekCard.addEventListener('mouseleave', () => {
    handleTabMouseLeave();
  });

  // Peek Card Actions
  btnPeekPin.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!activePeekId) return;
    const note = notes.find(n => n.id === activePeekId);
    if (note) {
      note.isPinned = !note.isPinned;
      saveNotes();
      renderPinnedNotes();
      playFluentSound('click');
    }
  });

  btnPeekEdit.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!activePeekId) return;
    const noteId = activePeekId;
    hidePeekCard();
    openNoteEditor(noteId);
  });

  if (btnPeekDelete) {
    btnPeekDelete.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!activePeekId) return;
      const noteId = activePeekId;
      deleteNoteById(noteId);
    });
  }

  peekCard.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    if (activePeekId) {
      const noteId = activePeekId;
      hidePeekCard();
      openNoteEditor(noteId);
    }
  });

  // --- Full Editor Modal Logic ---
  function openNoteEditor(noteId) {
    let note = notes.find(n => n.id === noteId);
    if (!note) {
      // Create new note
      note = createNewNote();
    }

    currentEditingId = note.id;
    appState.activeNoteId = note.id;
    saveAppState();

    // Set fields
    noteTitleInput.value = note.title;
    if (noteTagSelect) {
      noteTagSelect.value = note.tag || 'none';
    }
    setEditorContent(note.content);
    const font = note.fontStyle || 'clean';
    noteBodyInput.className = `win-note-textarea font-${font}`;
    if (fontStyleLabel) {
      fontStyleLabel.textContent = font === 'clean' ? 'Segoe UI' : 'Casual';
    }

    if (note.updatedAt) {
      const timeStr = new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      updateSaveStatus(`Saved · ${timeStr}`);
    } else {
      updateSaveStatus('Saved · now');
    }
    updateCharCount();
    updateFavoriteUI(note.isFavorite);

    // Apply color to editor window
    applyEditorColor(note.color);

    // Update active swatch
    paletteSwatches.forEach(swatch => {
      if (swatch.dataset.color === note.color) {
        swatch.classList.add('active');
      } else {
        swatch.classList.remove('active');
      }
    });

    // Restore size preference for this specific note or default
    if (note.customSize && note.customSize.width && note.customSize.height) {
      editorWindow.style.width = `${note.customSize.width}px`;
      editorWindow.style.height = `${note.customSize.height}px`;
    } else if (appState.editorSize && appState.editorSize.width && appState.editorSize.height) {
      editorWindow.style.width = `${appState.editorSize.width}px`;
      editorWindow.style.height = `${appState.editorSize.height}px`;
    } else {
      editorWindow.style.width = '460px';
      editorWindow.style.height = '420px';
    }

    updateWidgetNoteSwitcher(note.id);
    editorOverlay.classList.remove('hidden');
    if (isNativeWidget && window.pywebview && window.pywebview.api && window.pywebview.api.expand_from_edge) {
      window.pywebview.api.expand_from_edge(currentDockSide);
    }
    noteBodyInput.focus();
    if (window.electronAPI && window.electronAPI.isElectron) {
      window.electronAPI.setIgnoreMouseEvents(false);
    }
  }

  function applyEditorColor(colorKey) {
    editorWindow.className = `fluent-window theme-note-${colorKey}${editorWindow.classList.contains('is-positioned') ? ' is-positioned' : ''}`;
  }

  function closeNoteEditor() {
    if (!editorOverlay.classList.contains('hidden')) {
      flushSave(); // Save any and all unsaved changes immediately!
      playFluentSound('save');
      editorOverlay.classList.add('hidden');
      currentEditingId = null;
      appState.activeNoteId = null;
      saveAppState();
      renderDockTabs();
      if (window.electronAPI && window.electronAPI.isElectron) {
        window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
      }
    }
    if (isNativeWidget && window.pywebview && window.pywebview.api && window.pywebview.api.dock_to_edge) {
      window.pywebview.api.dock_to_edge(currentDockSide);
    }
  }

  function createNewNote() {
    const colors = ['yellow', 'peach', 'coral', 'rose', 'lilac', 'lavender', 'blue', 'seafoam', 'mint', 'pistachio', 'vanilla', 'slate'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newNote = {
      id: 'note-' + Date.now(),
      title: 'Untitled note',
      content: '',
      color: randomColor,
      tag: (currentTagFilter !== 'all' && currentTagFilter) ? currentTagFilter : 'none',
      isFavorite: false,
      isPinned: false,
      pinnedPos: { x: 200, y: 150 },
      fontStyle: 'clean',
      updatedAt: Date.now()
    };
    notes.unshift(newNote);
    saveNotes();
    renderDockTabs();
    return newNote;
  }

  let lastDeletedNote = null;
  let undoToastTimeout = null;

  function deleteNoteById(idToDelete) {
    if (!idToDelete) return;
    const noteToDelete = notes.find(n => n.id === idToDelete);
    const noteIndex = notes.findIndex(n => n.id === idToDelete);
    if (!noteToDelete) return;

    lastDeletedNote = { note: { ...noteToDelete }, index: noteIndex };
    playFluentSound('delete');

    // Remove note
    notes = notes.filter(n => n.id !== idToDelete);

    // If currently editing this note in full editor, close it
    if (currentEditingId === idToDelete) {
      clearTimeout(autoSaveTimeout);
      currentEditingId = null;
      appState.activeNoteId = null;
      editorOverlay.classList.add('hidden');
      if (window.electronAPI && window.electronAPI.isElectron) {
        window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
      }
      if (isNativeWidget && window.pywebview && window.pywebview.api && window.pywebview.api.dock_to_edge) {
        window.pywebview.api.dock_to_edge(currentDockSide);
      }
    }

    // Always hide peek card if open
    hidePeekCard();

    // Immediately persist deletion to disk & localStorage
    saveNotes();
    saveAppState();
    renderDockTabs();
    renderPinnedNotes();
    showUndoToast(`"${lastDeletedNote.note.title}" deleted`);
  }

  function deleteCurrentNote() {
    if (!currentEditingId) return;
    deleteNoteById(currentEditingId);
  }

  function showUndoToast(msg) {
    const toast = document.getElementById('undo-toast');
    const toastMsg = document.getElementById('undo-toast-message');
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    toast.classList.remove('hidden');

    clearTimeout(undoToastTimeout);
    undoToastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, 6000);
  }

  function undoDelete() {
    if (!lastDeletedNote) return;
    notes.splice(lastDeletedNote.index, 0, lastDeletedNote.note);
    saveNotes();
    renderDockTabs();
    playFluentSound('save');
    const toast = document.getElementById('undo-toast');
    if (toast) toast.classList.add('hidden');
    lastDeletedNote = null;
  }

  // --- Interactive Note Editor Canvas ---
  function getBulletSymbol(indent = 0) {
    if (indent === 1) return '◦'; // Level 1: hollow bullet
    if (indent === 2) return '▪'; // Level 2: small square
    if (indent >= 3) return '–'; // Level 3+: dash
    return '•'; // Level 0: default solid disc
  }

  function createCheckboxButtonHtml(isChecked) {
    return `<button type="button" class="editor-checkbox-btn" contenteditable="false" aria-label="Toggle task" title="${isChecked ? 'Click to uncheck' : 'Click to tick'}"><svg class="checkbox-svg" viewBox="0 0 16 16" width="15" height="15"><rect class="checkbox-box" x="1" y="1" width="14" height="14" rx="1.5" stroke="currentColor" stroke-width="1.6" fill="none"/><polyline class="checkbox-tick" points="3 8 6.5 12 13 3.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg></button>`;
  }

  function setCaretToEnd(el) {
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (!sel) return;
    const range = document.createRange();
    if (!el.childNodes.length) {
      el.innerHTML = '<br>';
    }
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function setCaretToStart(el) {
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (!sel) return;
    const range = document.createRange();
    if (!el.childNodes.length) {
      el.innerHTML = '<br>';
    }
    range.selectNodeContents(el);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function parseContentToEditorHtml(content) {
    if (!content) {
      return `<div class="editor-line text-item" data-type="text"><span class="editor-line-text" contenteditable="true"><br></span></div>`;
    }
    const lines = content.split('\n');
    return lines.map(rawLine => {
      // Empty line
      if (!rawLine || rawLine.length === 0) {
        return `<div class="editor-line text-item empty-line" data-type="text"><span class="editor-line-text" contenteditable="true"><br></span></div>`;
      }

      let indent = 0;
      let line = rawLine;
      const leadingMatch = rawLine.match(/^([ \t]+)/);
      if (leadingMatch) {
        const spaces = leadingMatch[1].replace(/\t/g, '  ').length;
        indent = Math.min(6, Math.floor(spaces / 2));
        line = rawLine.slice(leadingMatch[1].length);
      }
      const indentAttr = indent > 0 ? ` data-indent="${indent}"` : '';

      // Checked checklist item
      if (/^(\•\s*|[-]\s*)?\[[xX]\]\s*/.test(line) || /^(\•\s*|[-]\s*)?✓\s*/.test(line)) {
        const text = line.replace(/^(\•\s*|[-]\s*)?(\[[xX]\]|✓)\s*/, '');
        return `<div class="editor-line checklist-item checked"${indentAttr} data-type="check" data-checked="true">
          ${createCheckboxButtonHtml(true)}
          <span class="editor-line-text strike" contenteditable="true">${text ? escapeHtml(text) : '<br>'}</span>
        </div>`;
      }
      // Unchecked checklist item
      if (/^(\•\s*|[-]\s*)?\[\s*\]\s*/.test(line)) {
        const text = line.replace(/^(\•\s*|[-]\s*)?\[\s*\]\s*/, '');
        return `<div class="editor-line checklist-item"${indentAttr} data-type="check" data-checked="false">
          ${createCheckboxButtonHtml(false)}
          <span class="editor-line-text" contenteditable="true">${text ? escapeHtml(text) : '<br>'}</span>
        </div>`;
      }
      // Bullet item
      if (/^(\•|[-])\s*/.test(line)) {
        const text = line.replace(/^(\•|[-])\s*/, '');
        const bulletSymbol = getBulletSymbol(indent);
        return `<div class="editor-line bullet-item"${indentAttr} data-type="bullet">
          <span class="editor-bullet-dot" contenteditable="false">${bulletSymbol}</span>
          <span class="editor-line-text" contenteditable="true">${text ? escapeHtml(text) : '<br>'}</span>
        </div>`;
      }

      // Plain text line: render natural text directly without artificial block margins!
      return `<div class="editor-line text-item" data-type="text">
        <span class="editor-line-text" contenteditable="true">${escapeHtml(rawLine)}</span>
      </div>`;
    }).join('');
  }

  function getEditorContent() {
    const lines = [];
    const lineElements = noteBodyInput.querySelectorAll('.editor-line');
    if (lineElements.length === 0) {
      return (noteBodyInput.innerText || '').trim();
    }
    lineElements.forEach(line => {
      const textSpan = line.querySelector('.editor-line-text');
      const text = textSpan ? textSpan.innerText.replace(/\r?\n/g, '') : line.innerText.replace(/\r?\n/g, '');
      if (line.classList.contains('checklist-item')) {
        const indent = parseInt(line.dataset.indent || '0', 10);
        const indentPrefix = '  '.repeat(indent);
        const isChecked = line.classList.contains('checked') || line.dataset.checked === 'true';
        lines.push(`${indentPrefix}${isChecked ? '[x]' : '[ ]'} ${text.trimStart()}`);
      } else if (line.classList.contains('bullet-item')) {
        const indent = parseInt(line.dataset.indent || '0', 10);
        const indentPrefix = '  '.repeat(indent);
        lines.push(`${indentPrefix}• ${text.trimStart()}`);
      } else {
        // Plain text: use exact text content as entered, never double-indent!
        lines.push(text);
      }
    });
    return lines.join('\n');
  }

  function setEditorContent(content) {
    noteBodyInput.innerHTML = parseContentToEditorHtml(content);
    updateCharCount();
  }

  let autoSaveTimeout = null;

  function flushSave() {
    if (!currentEditingId) return;
    clearTimeout(autoSaveTimeout);
    const note = notes.find(n => n.id === currentEditingId);
    if (!note) return;

    note.title = noteTitleInput.value.trim() || 'Untitled note';
    note.content = getEditorContent();
    if (noteTagSelect) {
      note.tag = noteTagSelect.value;
    }
    note.updatedAt = Date.now();
    saveNotes();
    saveAppState();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    updateSaveStatus(`Saved · ${timeStr}`);
    updateCharCount();
    renderDockTabs();
  }

  function triggerAutoSave() {
    if (!currentEditingId) return;
    const note = notes.find(n => n.id === currentEditingId);
    if (!note) return;

    updateSaveStatus('Saving...', true);

    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
      flushSave();
      playFluentSound('save');
    }, 250);
  }

  let editorToastTimeout = null;
  function showEditorSaveToast(msg) {
    if (!editorSaveToast || !editorSaveToastText) return;
    editorSaveToastText.textContent = msg;
    editorSaveToast.classList.remove('hidden');
    clearTimeout(editorToastTimeout);
    editorToastTimeout = setTimeout(() => {
      editorSaveToast.classList.add('hidden');
    }, 2200);
  }

  let saveFeedbackTimeout = null;
  function manualSaveNote() {
    if (!currentEditingId) return;
    flushSave();
    playFluentSound('save');

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    updateSaveStatus(`Saved · ${timeStr}`);

    if (btnManualSaveBottom) {
      btnManualSaveBottom.classList.add('saved-flash');
      const textSpan = btnManualSaveBottom.querySelector('#bottom-save-text');
      if (textSpan) textSpan.textContent = '✓ Saved to Disk!';
    }

    showEditorSaveToast(`Saved to disk at ${timeStr}`);

    clearTimeout(saveFeedbackTimeout);
    saveFeedbackTimeout = setTimeout(() => {
      if (btnManualSaveBottom) {
        btnManualSaveBottom.classList.remove('saved-flash');
        const textSpan = btnManualSaveBottom.querySelector('#bottom-save-text');
        if (textSpan) textSpan.textContent = 'Save Note (Ctrl+S)';
      }
    }, 2000);
  }

  if (noteTagSelect) {
    noteTagSelect.addEventListener('change', () => {
      if (!currentEditingId) return;
      const note = notes.find(n => n.id === currentEditingId);
      if (!note) return;
      note.tag = noteTagSelect.value;
      note.updatedAt = Date.now();
      saveNotes();
      renderDockTabs();
      playFluentSound('save');
    });
  }

  function updateSaveStatus(text, isSaving = false) {
    if (!saveStatusIndicator) return;
    const textElem = saveStatusIndicator.querySelector('.status-text');
    if (textElem) {
      textElem.textContent = text;
    } else {
      saveStatusIndicator.textContent = text;
    }
    if (isSaving) {
      saveStatusIndicator.classList.add('saving');
    } else {
      saveStatusIndicator.classList.remove('saving');
    }
  }

  function updateCharCount() {
    if (!noteCharCount) return;
    const text = getEditorContent();
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    noteCharCount.textContent = `${lines.length} items · ${text.length} chars`;
  }

  function updateFavoriteUI(isFav) {
    if (isFav) {
      iconStarOutline.classList.add('hidden');
      iconStarFilled.classList.remove('hidden');
    } else {
      iconStarOutline.classList.remove('hidden');
      iconStarFilled.classList.add('hidden');
    }
  }

  // --- Click to Tick/Untick Checkbox & Route Cursor on Line Click ---
  noteBodyInput.addEventListener('click', (e) => {
    const checkBtn = e.target.closest('.editor-checkbox-btn');
    if (checkBtn) {
      e.preventDefault();
      e.stopPropagation();
      const line = checkBtn.closest('.checklist-item');
      if (line) {
        const isChecked = line.classList.contains('checked');
        const nextState = !isChecked;
        line.classList.toggle('checked', nextState);
        line.dataset.checked = nextState ? 'true' : 'false';

        const textSpan = line.querySelector('.editor-line-text');
        if (textSpan) {
          textSpan.classList.toggle('strike', nextState);
        }

        playFluentSound('click');
        triggerAutoSave();
      }
      return;
    }

    // Direct click anywhere on an editor line places cursor into its text span
    const line = e.target.closest('.editor-line');
    if (line) {
      const textSpan = line.querySelector('.editor-line-text');
      if (textSpan && e.target !== textSpan) {
        setCaretToEnd(textSpan);
      }
      return;
    }

    // Clicked in empty space below lines
    if (e.target === noteBodyInput) {
      const lastLine = noteBodyInput.querySelector('.editor-line:last-child');
      if (lastLine) {
        const textSpan = lastLine.querySelector('.editor-line-text');
        if (textSpan) {
          setCaretToEnd(textSpan);
        }
      }
    }
  });

  // --- Formatting Toolbar Actions ---
  if (btnFormatBold) {
    btnFormatBold.addEventListener('click', () => {
      document.execCommand('bold', false, null);
      triggerAutoSave();
      playFluentSound('click');
    });
  }
  if (btnFormatItalic) {
    btnFormatItalic.addEventListener('click', () => {
      document.execCommand('italic', false, null);
      triggerAutoSave();
      playFluentSound('click');
    });
  }
  if (btnFormatUnderline) {
    btnFormatUnderline.addEventListener('click', () => {
      document.execCommand('underline', false, null);
      triggerAutoSave();
      playFluentSound('click');
    });
  }
  if (btnFormatStrike) {
    btnFormatStrike.addEventListener('click', () => {
      document.execCommand('strikeThrough', false, null);
      triggerAutoSave();
      playFluentSound('click');
    });
  }

  if (btnFormatBullet) {
    btnFormatBullet.addEventListener('click', () => {
      const sel = window.getSelection();
      let currentLine = null;
      if (sel && sel.rangeCount > 0) {
        currentLine = sel.anchorNode.closest ? sel.anchorNode.closest('.editor-line') : (sel.anchorNode.parentElement ? sel.anchorNode.parentElement.closest('.editor-line') : null);
      }

      if (currentLine && noteBodyInput.contains(currentLine)) {
        const textSpan = currentLine.querySelector('.editor-line-text') || currentLine;
        const currentText = textSpan.innerText || '';
        const currentIndent = parseInt(currentLine.dataset.indent || '0', 10);
        currentLine.className = 'editor-line bullet-item';
        currentLine.dataset.type = 'bullet';
        currentLine.innerHTML = `
          <span class="editor-bullet-dot" contenteditable="false">${getBulletSymbol(currentIndent)}</span>
          <span class="editor-line-text" contenteditable="true">${currentText ? escapeHtml(currentText) : '<br>'}</span>
        `;
        setCaretToEnd(currentLine.querySelector('.editor-line-text'));
      } else {
        const newLine = document.createElement('div');
        newLine.className = 'editor-line bullet-item';
        newLine.dataset.type = 'bullet';
        newLine.innerHTML = `
          <span class="editor-bullet-dot" contenteditable="false">•</span>
          <span class="editor-line-text" contenteditable="true"><br></span>
        `;
        noteBodyInput.appendChild(newLine);
        setCaretToEnd(newLine.querySelector('.editor-line-text'));
      }
      triggerAutoSave();
      playFluentSound('click');
    });
  }

  if (btnFormatCheck) {
    btnFormatCheck.addEventListener('click', () => {
      const sel = window.getSelection();
      let currentLine = null;
      if (sel && sel.rangeCount > 0) {
        currentLine = sel.anchorNode.closest ? sel.anchorNode.closest('.editor-line') : (sel.anchorNode.parentElement ? sel.anchorNode.parentElement.closest('.editor-line') : null);
      }

      if (currentLine && noteBodyInput.contains(currentLine)) {
        const textSpan = currentLine.querySelector('.editor-line-text') || currentLine;
        const currentText = textSpan.innerText || '';
        currentLine.className = 'editor-line checklist-item';
        currentLine.dataset.type = 'check';
        currentLine.dataset.checked = 'false';
        currentLine.innerHTML = `
          ${createCheckboxButtonHtml(false)}
          <span class="editor-line-text" contenteditable="true">${currentText ? escapeHtml(currentText) : '<br>'}</span>
        `;
        setCaretToEnd(currentLine.querySelector('.editor-line-text'));
      } else {
        const newLine = document.createElement('div');
        newLine.className = 'editor-line checklist-item';
        newLine.dataset.type = 'check';
        newLine.dataset.checked = 'false';
        newLine.innerHTML = `
          ${createCheckboxButtonHtml(false)}
          <span class="editor-line-text" contenteditable="true"><br></span>
        `;
        noteBodyInput.appendChild(newLine);
        setCaretToEnd(newLine.querySelector('.editor-line-text'));
      }
      triggerAutoSave();
      playFluentSound('click');
    });
  }

  if (btnFontStyle) {
    btnFontStyle.addEventListener('click', () => {
      if (!currentEditingId) return;
      const note = notes.find(n => n.id === currentEditingId);
      if (!note) return;

      note.fontStyle = (note.fontStyle === 'casual') ? 'clean' : 'casual';
      noteBodyInput.className = `win-note-textarea font-${note.fontStyle}`;
      if (fontStyleLabel) {
        fontStyleLabel.textContent = note.fontStyle === 'clean' ? 'Segoe UI' : 'Casual';
      }
      saveNotes();
      playFluentSound('click');
    });
  }

  // Copy note
  const btnCopyNote = document.getElementById('btn-copy-note');
  if (btnCopyNote) {
    btnCopyNote.addEventListener('click', () => {
      const text = getEditorContent();
      navigator.clipboard.writeText(text).then(() => {
        playFluentSound('save');
      });
    });
  }

  // Export note as Markdown
  const btnExportNote = document.getElementById('btn-export-note');
  if (btnExportNote) {
    btnExportNote.addEventListener('click', () => {
      if (!currentEditingId) return;
      const note = notes.find(n => n.id === currentEditingId);
      if (!note) return;
      const blob = new Blob([getEditorContent()], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
      a.click();
      URL.revokeObjectURL(url);
      playFluentSound('save');
    });
  }

  // Input listeners
  noteTitleInput.addEventListener('input', () => {
    triggerAutoSave();
    if (widgetNoteSwitcher && currentEditingId) {
      const opt = widgetNoteSwitcher.querySelector(`option[value="${currentEditingId}"]`);
      if (opt) opt.textContent = (noteTitleInput.value.trim() || 'Untitled note').substring(0, 20);
    }
  });

  noteTitleInput.addEventListener('blur', () => {
    flushSave();
  });

  noteBodyInput.addEventListener('blur', () => {
    flushSave();
  });

  window.addEventListener('beforeunload', () => {
    flushSave();
  });

  // Auto-detect typed [] or [ ] and convert into interactive checkbox
  noteBodyInput.addEventListener('input', () => {
    const sel = window.getSelection();
    let currentLine = null;
    if (sel && sel.rangeCount > 0) {
      currentLine = sel.anchorNode.closest ? sel.anchorNode.closest('.editor-line') : (sel.anchorNode.parentElement ? sel.anchorNode.parentElement.closest('.editor-line') : null);
    }
    if (currentLine && !currentLine.classList.contains('checklist-item')) {
      const textSpan = currentLine.querySelector('.editor-line-text') || currentLine;
      const text = textSpan.innerText || '';
      if (/^(\•\s*|[-]\s*)?\[\s*\]\s*/.test(text)) {
        const cleanText = text.replace(/^(\•\s*|[-]\s*)?\[\s*\]\s*/, '');
        currentLine.className = 'editor-line checklist-item';
        currentLine.dataset.type = 'check';
        currentLine.dataset.checked = 'false';
        currentLine.innerHTML = `
          ${createCheckboxButtonHtml(false)}
          <span class="editor-line-text" contenteditable="true">${escapeHtml(cleanText)}</span>
        `;
        const newSpan = currentLine.querySelector('.editor-line-text');
        newSpan.focus();
        const range = document.createRange();
        range.selectNodeContents(newSpan);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
    triggerAutoSave();
  });

  // Keydown listener for Tab (indent), Enter, and Backspace in lines
  noteBodyInput.addEventListener('keydown', (e) => {
    // --- TAB: Indent / Outdent ---
    if (e.key === 'Tab') {
      e.preventDefault();
      const sel = window.getSelection();
      let currentLine = null;
      if (sel && sel.rangeCount > 0) {
        currentLine = sel.anchorNode.closest ? sel.anchorNode.closest('.editor-line') : (sel.anchorNode.parentElement ? sel.anchorNode.parentElement.closest('.editor-line') : null);
      }
      if (!currentLine) {
        currentLine = noteBodyInput.querySelector('.editor-line:first-child');
      }
      if (!currentLine) return;

      let indent = parseInt(currentLine.dataset.indent || '0', 10);

      if (e.shiftKey) {
        // Shift + Tab -> Outdent
        if (indent > 0) {
          indent--;
          if (indent === 0) {
            delete currentLine.dataset.indent;
          } else {
            currentLine.dataset.indent = indent;
          }
          const bulletDot = currentLine.querySelector('.editor-bullet-dot');
          if (bulletDot) {
            bulletDot.textContent = getBulletSymbol(indent);
          }
          triggerAutoSave();
        }
      } else {
        // Tab -> Indent
        if (indent < 6) {
          indent++;
          currentLine.dataset.indent = indent;
          const bulletDot = currentLine.querySelector('.editor-bullet-dot');
          if (bulletDot) {
            bulletDot.textContent = getBulletSymbol(indent);
          }
          triggerAutoSave();
        }
      }
      return;
    }

    // --- ENTER: Next Line (inheriting indent) or Outdent if empty ---
    if (e.key === 'Enter') {
      e.preventDefault();
      const sel = window.getSelection();
      let currentLine = null;
      if (sel && sel.rangeCount > 0) {
        currentLine = sel.anchorNode.closest ? sel.anchorNode.closest('.editor-line') : (sel.anchorNode.parentElement ? sel.anchorNode.parentElement.closest('.editor-line') : null);
      }
      if (!currentLine) {
        currentLine = noteBodyInput.querySelector('.editor-line:last-child');
      }

      const isCheck = currentLine && currentLine.classList.contains('checklist-item');
      const isBullet = currentLine && currentLine.classList.contains('bullet-item');
      const textSpan = currentLine ? currentLine.querySelector('.editor-line-text') : null;
      const currentIndent = currentLine ? parseInt(currentLine.dataset.indent || '0', 10) : 0;

      // If user presses Enter on an empty checklist or bullet item:
      const currentText = textSpan ? textSpan.innerText.replace(/[\r\n\u200B]/g, '').trim() : '';
      if ((isCheck || isBullet) && currentText === '') {
        // If it was indented, outdent it first!
        if (currentIndent > 0) {
          const newIndent = currentIndent - 1;
          if (newIndent === 0) {
            delete currentLine.dataset.indent;
          } else {
            currentLine.dataset.indent = newIndent;
          }
          const bulletDot = currentLine.querySelector('.editor-bullet-dot');
          if (bulletDot) {
            bulletDot.textContent = getBulletSymbol(newIndent);
          }
          triggerAutoSave();
          return;
        }

        // At level 0 and empty: exit list mode (convert to plain text)
        currentLine.className = 'editor-line text-item';
        currentLine.dataset.type = 'text';
        delete currentLine.dataset.checked;
        delete currentLine.dataset.indent;
        currentLine.innerHTML = `<span class="editor-line-text" contenteditable="true"><br></span>`;
        const span = currentLine.querySelector('.editor-line-text');
        setCaretToEnd(span);
        triggerAutoSave();
        return;
      }

      // Check if splitting text at cursor
      let textAfter = '';
      if (textSpan && sel && sel.rangeCount > 0) {
        try {
          const range = sel.getRangeAt(0);
          const postRange = document.createRange();
          postRange.selectNodeContents(textSpan);
          postRange.setStart(range.endContainer, range.endOffset);
          textAfter = postRange.toString();

          const preRange = document.createRange();
          preRange.selectNodeContents(textSpan);
          preRange.setEnd(range.startContainer, range.startOffset);
          const textBefore = preRange.toString();
          textSpan.textContent = textBefore;
          if (!textBefore) textSpan.innerHTML = '<br>';
        } catch (err) {
          textAfter = '';
        }
      }

      const newLine = document.createElement('div');
      if (currentIndent > 0) {
        newLine.dataset.indent = currentIndent;
      }

      if (isCheck) {
        newLine.className = 'editor-line checklist-item';
        newLine.dataset.type = 'check';
        newLine.dataset.checked = 'false';
        newLine.innerHTML = `
          ${createCheckboxButtonHtml(false)}
          <span class="editor-line-text" contenteditable="true">${textAfter ? escapeHtml(textAfter) : '<br>'}</span>
        `;
      } else if (isBullet) {
        newLine.className = 'editor-line bullet-item';
        newLine.dataset.type = 'bullet';
        newLine.innerHTML = `
          <span class="editor-bullet-dot" contenteditable="false">${getBulletSymbol(currentIndent)}</span>
          <span class="editor-line-text" contenteditable="true">${textAfter ? escapeHtml(textAfter) : '<br>'}</span>
        `;
      } else {
        newLine.className = 'editor-line text-item';
        newLine.dataset.type = 'text';
        newLine.innerHTML = `<span class="editor-line-text" contenteditable="true">${textAfter ? escapeHtml(textAfter) : '<br>'}</span>`;
      }

      if (currentLine && currentLine.nextSibling) {
        noteBodyInput.insertBefore(newLine, currentLine.nextSibling);
      } else {
        noteBodyInput.appendChild(newLine);
      }

      const newText = newLine.querySelector('.editor-line-text');
      setCaretToStart(newText);
      triggerAutoSave();
      return;
    }

    // --- BACKSPACE: Outdent at start of line or remove empty item ---
    if (e.key === 'Backspace') {
      const sel = window.getSelection();
      let currentLine = null;
      if (sel && sel.rangeCount > 0) {
        currentLine = sel.anchorNode.closest ? sel.anchorNode.closest('.editor-line') : (sel.anchorNode.parentElement ? sel.anchorNode.parentElement.closest('.editor-line') : null);
      }

      if (currentLine) {
        const textSpan = currentLine.querySelector('.editor-line-text');
        const text = textSpan ? textSpan.innerText.replace(/[\r\n\u200B]/g, '').trim() : '';
        const currentIndent = parseInt(currentLine.dataset.indent || '0', 10);

        let isAtStart = false;
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          if (range.collapsed && range.startOffset === 0) {
            isAtStart = true;
          }
        }

        // If indented and cursor is at start of line:
        if (currentIndent > 0 && (text === '' || isAtStart)) {
          e.preventDefault();
          const newIndent = currentIndent - 1;
          if (newIndent === 0) {
            delete currentLine.dataset.indent;
          } else {
            currentLine.dataset.indent = newIndent;
          }
          const bulletDot = currentLine.querySelector('.editor-bullet-dot');
          if (bulletDot) {
            bulletDot.textContent = getBulletSymbol(newIndent);
          }
          triggerAutoSave();
          return;
        }

        if (text === '') {
          if (currentLine.classList.contains('checklist-item') || currentLine.classList.contains('bullet-item')) {
            e.preventDefault();
            currentLine.className = 'editor-line text-item';
            currentLine.dataset.type = 'text';
            delete currentLine.dataset.checked;
            delete currentLine.dataset.indent;
            currentLine.innerHTML = `<span class="editor-line-text" contenteditable="true"><br></span>`;
            const span = currentLine.querySelector('.editor-line-text');
            setCaretToEnd(span);
            triggerAutoSave();
            return;
          } else if (noteBodyInput.children.length > 1) {
            e.preventDefault();
            const prevLine = currentLine.previousElementSibling;
            currentLine.remove();
            if (prevLine) {
              const prevSpan = prevLine.querySelector('.editor-line-text') || prevLine;
              setCaretToEnd(prevSpan);
            }
            triggerAutoSave();
            return;
          }
        }
      }
    }
  });

  // Palette Swatches selection
  paletteSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      const color = swatch.dataset.color;
      if (!currentEditingId) return;
      const note = notes.find(n => n.id === currentEditingId);
      if (!note) return;

      note.color = color;
      applyEditorColor(color);

      paletteSwatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');

      saveNotes();
      renderDockTabs();
      playFluentSound('click');
    });
  });

  // Toggle Favorite
  btnFavoriteNote.addEventListener('click', () => {
    if (!currentEditingId) return;
    const note = notes.find(n => n.id === currentEditingId);
    if (!note) return;

    note.isFavorite = !note.isFavorite;
    updateFavoriteUI(note.isFavorite);
    saveNotes();
    renderDockTabs();
    playFluentSound('click');
  });

  // Toggle Pin inside modal
  if (btnPinNote) {
    btnPinNote.addEventListener('click', () => {
      if (!currentEditingId) return;
      const note = notes.find(n => n.id === currentEditingId);
      if (!note) return;

      note.isPinned = !note.isPinned;
      saveNotes();
      renderPinnedNotes();
      playFluentSound('click');
    });
  }

  // Windows Caption buttons & Manual Save buttons
  if (btnCaptionMinimize) btnCaptionMinimize.addEventListener('click', closeNoteEditor);
  if (btnCaptionClose) btnCaptionClose.addEventListener('click', closeNoteEditor);
  if (btnCloseNote) btnCloseNote.addEventListener('click', closeNoteEditor);
  if (btnDeleteNote) btnDeleteNote.addEventListener('click', deleteCurrentNote);


  if (btnManualSaveBottom) {
    btnManualSaveBottom.addEventListener('click', (e) => {
      e.preventDefault();
      manualSaveNote();
    });
  }

  // Global Ctrl + S / Cmd + S keyboard shortcut to instantly save
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      if (currentEditingId) {
        manualSaveNote();
      }
    }
  });

  // --- Maximize & Size Presets Management ---
  let isMaximized = false;
  let preMaxState = null;

  function toggleMaximizeEditor() {
    isMaximized = !isMaximized;
    appState.isMaximized = isMaximized;

    if (isMaximized) {
      const rect = editorWindow.getBoundingClientRect();
      preMaxState = {
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top,
        isPositioned: editorWindow.classList.contains('is-positioned')
      };

      const maxW = Math.min(920, window.innerWidth - 40);
      const maxH = Math.min(720, window.innerHeight - 60);
      editorWindow.style.width = `${maxW}px`;
      editorWindow.style.height = `${maxH}px`;

      // Center the maximized window
      editorWindow.classList.add('is-positioned');
      editorWindow.style.position = 'fixed';
      editorWindow.style.left = `${Math.max(20, Math.round((window.innerWidth - maxW) / 2))}px`;
      editorWindow.style.top = `${Math.max(20, Math.round((window.innerHeight - maxH) / 2))}px`;
      editorWindow.style.margin = '0';
      editorWindow.style.transform = 'none';

      if (btnCaptionMaximize) {
        btnCaptionMaximize.title = 'Restore Previous Size';
      }
    } else {
      if (preMaxState) {
        editorWindow.style.width = `${preMaxState.width}px`;
        editorWindow.style.height = `${preMaxState.height}px`;
        if (preMaxState.isPositioned) {
          editorWindow.style.left = `${preMaxState.left}px`;
          editorWindow.style.top = `${preMaxState.top}px`;
        } else {
          recenterEditor();
        }
      } else {
        editorWindow.style.width = '460px';
        editorWindow.style.height = '420px';
        recenterEditor();
      }

      if (btnCaptionMaximize) {
        btnCaptionMaximize.title = 'Maximize / Restore Size';
      }
    }

    const finalRect = editorWindow.getBoundingClientRect();
    appState.editorSize = { width: Math.round(finalRect.width), height: Math.round(finalRect.height) };
    if (editorWindow.classList.contains('is-positioned')) {
      appState.editorPos = { x: Math.round(finalRect.left), y: Math.round(finalRect.top) };
    }
    saveAppState();
    playFluentSound('click');
  }

  if (btnCaptionMaximize) {
    btnCaptionMaximize.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMaximizeEditor();
    });
  }

  // --- Size Presets Flyout Menu ---
  const sizePresets = {
    compact: { width: 380, height: 340 },
    standard: { width: 460, height: 420 },
    large: { width: 640, height: 520 },
    wide: { width: 760, height: 440 },
    spacious: { width: 840, height: 640 }
  };

  function updateActiveSizePresetUI(width, height) {
    let matchedKey = null;
    for (const [key, dims] of Object.entries(sizePresets)) {
      if (Math.abs(dims.width - width) < 25 && Math.abs(dims.height - height) < 25) {
        matchedKey = key;
        break;
      }
    }
    document.querySelectorAll('.size-preset-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.preset === matchedKey);
    });
  }

  function applySizePreset(presetKey) {
    const preset = sizePresets[presetKey];
    if (!preset) return;

    editorWindow.style.width = `${preset.width}px`;
    editorWindow.style.height = `${preset.height}px`;

    // Ensure within screen bounds
    const rect = editorWindow.getBoundingClientRect();
    if (rect.right > window.innerWidth - 10 || rect.bottom > window.innerHeight - 10) {
      const newLeft = Math.max(10, Math.min(rect.left, window.innerWidth - preset.width - 10));
      const newTop = Math.max(10, Math.min(rect.top, window.innerHeight - preset.height - 10));
      editorWindow.classList.add('is-positioned');
      editorWindow.style.position = 'fixed';
      editorWindow.style.left = `${newLeft}px`;
      editorWindow.style.top = `${newTop}px`;
    }

    appState.editorSize = { width: preset.width, height: preset.height };
    if (editorWindow.classList.contains('is-positioned')) {
      const finalRect = editorWindow.getBoundingClientRect();
      appState.editorPos = { x: Math.round(finalRect.left), y: Math.round(finalRect.top) };
    }
    isMaximized = false;
    appState.isMaximized = false;
    saveAppState();

    if (currentEditingId) {
      const note = notes.find(n => n.id === currentEditingId);
      if (note) {
        note.customSize = { width: preset.width, height: preset.height };
        saveNotes();
      }
    }

    updateActiveSizePresetUI(preset.width, preset.height);
    if (editorSizePopover) editorSizePopover.classList.add('hidden');
    playFluentSound('click');
  }

  if (btnEditorSizePresets && editorSizePopover) {
    btnEditorSizePresets.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = editorSizePopover.classList.contains('hidden');
      if (isHidden) {
        const curW = editorWindow.offsetWidth;
        const curH = editorWindow.offsetHeight;
        updateActiveSizePresetUI(curW, curH);
        editorSizePopover.classList.remove('hidden');
        playFluentSound('click');
      } else {
        editorSizePopover.classList.add('hidden');
      }
    });

    document.querySelectorAll('.size-preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        applySizePreset(btn.dataset.preset);
      });
    });

    if (btnResetNoteSize) {
      btnResetNoteSize.addEventListener('click', (e) => {
        e.stopPropagation();
        applySizePreset('standard');
        recenterEditor();
      });
    }

    // Close size popover when clicking anywhere else
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#editor-size-popover') && !e.target.closest('#btn-editor-size-presets')) {
        editorSizePopover.classList.add('hidden');
      }
    });
  }

  // --- 8-Direction Drag-to-Resize Handles & Corner Grip Logic ---
  let isResizingEditor = false;
  let resizeDir = '';
  let resizeStartX = 0;
  let resizeStartY = 0;
  let resizeStartWidth = 0;
  let resizeStartHeight = 0;
  let resizeStartLeft = 0;
  let resizeStartTop = 0;

  function startResizeEditor(e, dir) {
    e.preventDefault();
    e.stopPropagation();

    isResizingEditor = true;
    resizeDir = dir;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;

    const rect = editorWindow.getBoundingClientRect();
    resizeStartWidth = rect.width;
    resizeStartHeight = rect.height;
    resizeStartLeft = rect.left;
    resizeStartTop = rect.top;

    editorWindow.classList.add('is-positioned');
    editorWindow.style.position = 'fixed';
    editorWindow.style.left = `${rect.left}px`;
    editorWindow.style.top = `${rect.top}px`;
    editorWindow.style.margin = '0';
    editorWindow.style.transform = 'none';
    editorWindow.style.transition = 'none';

    document.body.style.userSelect = 'none';
  }

  // Bind 8 edge/corner resize handles
  editorWindow.querySelectorAll('.win-resize-edge, .win-resize-corner').forEach(handle => {
    handle.addEventListener('mousedown', (e) => {
      startResizeEditor(e, handle.dataset.dir);
    });
  });

  // Bind visible corner resize grip
  if (editorResizeGrip) {
    editorResizeGrip.addEventListener('mousedown', (e) => {
      startResizeEditor(e, 'se');
    });
  }

  // --- Draggable Editor Window (Smooth, Precision 1:1 Pixel Dragging) ---
  let isDraggingEditor = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  const editorCaptionBar = document.getElementById('editor-caption-bar');
  const editorMicrobar = document.querySelector('.win-editor-microbar');

  function startEditorDrag(e) {
    // Don't initiate drag on buttons, inputs, select, caption dots, or resize handles
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('.caption-dot') || e.target.closest('select') || e.target.closest('.win-save-badge') || e.target.closest('.win-resize-edge') || e.target.closest('.win-resize-corner') || e.target.closest('.win-resize-grip') || e.target.closest('.editor-size-popover')) {
      return;
    }
    isDraggingEditor = true;
    const rect = editorWindow.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;

    editorWindow.classList.add('is-positioned');
    editorWindow.style.position = 'fixed';
    editorWindow.style.left = `${rect.left}px`;
    editorWindow.style.top = `${rect.top}px`;
    editorWindow.style.margin = '0';
    editorWindow.style.transform = 'none';
    editorWindow.style.transition = 'none';

    document.body.style.userSelect = 'none';
  }

  function recenterEditor() {
    editorWindow.classList.remove('is-positioned');
    editorWindow.style.position = '';
    editorWindow.style.left = '';
    editorWindow.style.top = '';
    editorWindow.style.margin = '';
    editorWindow.style.transform = '';
    appState.editorPos = null;
    saveAppState();
    playFluentSound('click');
  }

  if (editorCaptionBar) {
    editorCaptionBar.title = 'Drag to move · Double-click to maximize/restore';
    editorCaptionBar.addEventListener('mousedown', startEditorDrag);

    // Double-click titlebar to toggle maximize / restore
    editorCaptionBar.addEventListener('dblclick', (e) => {
      if (e.target.closest('button') || e.target.closest('input') || e.target.closest('.caption-dot') || e.target.closest('.win-save-badge')) return;
      toggleMaximizeEditor();
    });
  }

  if (editorMicrobar) {
    editorMicrobar.addEventListener('mousedown', startEditorDrag);
    editorMicrobar.addEventListener('dblclick', (e) => {
      if (e.target.closest('button') || e.target.closest('select')) return;
      recenterEditor();
    });
  }

  window.addEventListener('mousemove', (e) => {
    // 1. Handle Window Resizing
    if (isResizingEditor) {
      e.preventDefault();
      const dx = e.clientX - resizeStartX;
      const dy = e.clientY - resizeStartY;

      const minW = 320;
      const maxW = Math.max(minW, window.innerWidth - 20);
      const minH = 260;
      const maxH = Math.max(minH, window.innerHeight - 20);

      let newW = resizeStartWidth;
      let newH = resizeStartHeight;
      let newLeft = resizeStartLeft;
      let newTop = resizeStartTop;

      // Handle Horizontal Resize
      if (resizeDir.includes('e')) {
        newW = Math.min(maxW, Math.max(minW, resizeStartWidth + dx));
      } else if (resizeDir.includes('w')) {
        newW = Math.min(maxW, Math.max(minW, resizeStartWidth - dx));
        newLeft = resizeStartLeft + (resizeStartWidth - newW);
        if (newLeft < 10) {
          newLeft = 10;
          newW = resizeStartLeft + resizeStartWidth - 10;
        }
      }

      // Handle Vertical Resize
      if (resizeDir.includes('s')) {
        newH = Math.min(maxH, Math.max(minH, resizeStartHeight + dy));
      } else if (resizeDir.includes('n')) {
        newH = Math.min(maxH, Math.max(minH, resizeStartHeight - dy));
        newTop = resizeStartTop + (resizeStartHeight - newH);
        if (newTop < 10) {
          newTop = 10;
          newH = resizeStartTop + resizeStartHeight - 10;
        }
      }

      editorWindow.style.width = `${Math.round(newW)}px`;
      editorWindow.style.height = `${Math.round(newH)}px`;
      if (resizeDir.includes('w')) {
        editorWindow.style.left = `${Math.round(newLeft)}px`;
      }
      if (resizeDir.includes('n')) {
        editorWindow.style.top = `${Math.round(newTop)}px`;
      }
      return;
    }

    // 2. Handle Window Dragging
    if (!isDraggingEditor) return;
    e.preventDefault();

    let newX = e.clientX - dragOffsetX;
    let newY = e.clientY - dragOffsetY;

    const minX = 10;
    const maxX = Math.max(10, window.innerWidth - editorWindow.offsetWidth - 10);
    const minY = 10;
    const maxY = Math.max(10, window.innerHeight - 80);

    newX = Math.max(minX, Math.min(newX, maxX));
    newY = Math.max(minY, Math.min(newY, maxY));

    editorWindow.style.left = `${newX}px`;
    editorWindow.style.top = `${newY}px`;
  });

  window.addEventListener('mouseup', () => {
    // 1. Finish Resizing
    if (isResizingEditor) {
      isResizingEditor = false;
      document.body.style.userSelect = '';
      editorWindow.style.transition = '';

      const rect = editorWindow.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);

      appState.editorSize = { width: w, height: h };
      appState.editorPos = { x: Math.round(rect.left), y: Math.round(rect.top) };
      isMaximized = false;
      appState.isMaximized = false;
      saveAppState();

      if (currentEditingId) {
        const note = notes.find(n => n.id === currentEditingId);
        if (note) {
          note.customSize = { width: w, height: h };
          saveNotes();
        }
      }
      return;
    }

    // 2. Finish Dragging
    if (!isDraggingEditor) return;
    isDraggingEditor = false;
    document.body.style.userSelect = '';
    editorWindow.style.transition = '';

    const rect = editorWindow.getBoundingClientRect();
    appState.editorPos = { x: Math.round(rect.left), y: Math.round(rect.top) };
    saveAppState();
  });

  // Mark all complete
  if (btnCompleteNote) {
    btnCompleteNote.addEventListener('click', () => {
      if (!currentEditingId) return;
      const note = notes.find(n => n.id === currentEditingId);
      if (!note) return;

      // Toggle checklist states or strikethroughs
      const lines = note.content.split('\n');
      const updated = lines.map(line => {
        if (line.startsWith('[ ] ')) return line.replace('[ ] ', '[x] ');
        if (line.startsWith('• ') && !line.includes('✓')) return line + ' ✓';
        return line;
      }).join('\n');

      note.content = updated;
      setEditorContent(updated);
      triggerAutoSave();
    });
  }

  // Close when clicking backdrop
  editorOverlay.addEventListener('click', (e) => {
    if (e.target === editorOverlay) {
      closeNoteEditor();
    }
  });

  // --- Search Filter ---
  notesSearchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    renderDockTabs();
  });

  // --- FAB Add Note Button ---
  btnAddNote.addEventListener('click', () => {
    playFluentSound('click');
    const note = createNewNote();
    openNoteEditor(note.id);
  });

  // --- Dismiss Instruction Badge ---
  btnDismissBadge.addEventListener('click', () => {
    instructionBadge.classList.add('hidden');
  });

  // --- Wallpaper Switcher ---
  const WALLPAPERS = ['wallpaper-bloom-dark', 'wallpaper-bloom-light', 'wallpaper-minimal-slate'];
  let currentWallpaperIndex = 0;

  btnWallpaperToggle.addEventListener('click', () => {
    currentWallpaperIndex = (currentWallpaperIndex + 1) % WALLPAPERS.length;
    document.body.className = document.body.className
      .replace(/wallpaper-[a-z-]+/g, '')
      .trim() + ' ' + WALLPAPERS[currentWallpaperIndex];
    playFluentSound('click');
  });

  // --- Windows Dark / Light Theme Switcher ---
  btnThemeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    document.body.classList.toggle('theme-dark', !isDark);
    document.body.classList.toggle('theme-light', isDark);

    if (newTheme === 'light') {
      iconThemeDark.classList.add('hidden');
      iconThemeLight.classList.remove('hidden');
      if (document.body.classList.contains('wallpaper-bloom-dark')) {
        document.body.classList.remove('wallpaper-bloom-dark');
        document.body.classList.add('wallpaper-bloom-light');
      }
    } else {
      iconThemeDark.classList.remove('hidden');
      iconThemeLight.classList.add('hidden');
      if (document.body.classList.contains('wallpaper-bloom-light')) {
        document.body.classList.remove('wallpaper-bloom-light');
        document.body.classList.add('wallpaper-bloom-dark');
      }
    }
    playFluentSound('click');
  });

  // --- Audio Toggle ---
  if (btnSoundToggle) {
    btnSoundToggle.addEventListener('click', () => toggleSound());
  }
  if (btnDockSound) {
    btnDockSound.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSound();
    });
  }
  if (btnEditorSoundToggle) {
    btnEditorSoundToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSound();
    });
  }

  // --- Reset Sample Data ---
  btnResetDemo.addEventListener('click', () => {
    if (confirm('Reset to sample sticky notes from the video?')) {
      notes = JSON.parse(JSON.stringify(DEFAULT_NOTES));
      saveNotes();
      renderDockTabs();
      playFluentSound('click');
    }
  });

  // --- Taskbar Sticky App Button ---
  taskbarStickyApp.addEventListener('click', () => {
    playFluentSound('click');
    // Open the first note or create a new one
    if (notes.length > 0) {
      openNoteEditor(notes[0].id);
    } else {
      const note = createNewNote();
      openNoteEditor(note.id);
    }
  });

  // --- Live Windows 11 Taskbar Clock ---
  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const formattedHours = hours.toString().padStart(2, '0');

    clockTime.textContent = `${formattedHours}:${minutes} ${ampm}`;

    const month = now.getMonth() + 1;
    const day = now.getDate();
    const year = now.getFullYear();
    clockDate.textContent = `${month}/${day}/${year}`;
  }

  // --- Keyboard Shortcuts & Arrow Key Navigation ---
  function activateTabByIndex(index, visibleNotes) {
    if (!visibleNotes || visibleNotes.length === 0) return;
    const note = visibleNotes[index];
    if (!note) return;

    // Remove keyboard focus from all tabs
    document.querySelectorAll('.dock-tab-item').forEach(t => t.classList.remove('keyboard-focus'));

    // Find matching tab DOM element
    const tabs = dockTabList.querySelectorAll('.dock-tab-item');
    const targetTab = tabs[index];
    if (targetTab) {
      targetTab.classList.add('keyboard-focus');
      handleTabMouseEnter(note, targetTab);
      expandNativeWindow();
      targetTab.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      playFluentSound('peek');
    }
  }

  window.addEventListener('keydown', (e) => {
    // Ctrl + N: New Note
    if (e.ctrlKey && e.key.toLowerCase() === 'n') {
      e.preventDefault();
      const note = createNewNote();
      openNoteEditor(note.id);
      return;
    }

    // Escape: Close Editor or Peek Card or Search
    if (e.key === 'Escape') {
      if (dockSearchPopup && !dockSearchPopup.classList.contains('hidden')) {
        dockSearchPopup.classList.add('hidden');
        collapseNativeWindow();
      }
      closeNoteEditor();
      hidePeekCard();
      return;
    }

    // Ctrl + F: Focus Search
    if (e.ctrlKey && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      if (dockSearchPopup && dockSearchInput) {
        expandNativeWindow();
        dockSearchPopup.classList.remove('hidden');
        dockSearchInput.focus();
      } else if (notesSearchInput) {
        notesSearchInput.focus();
      }
      return;
    }

    // Keyboard Arrow Navigation (↑ / ↓) through Docked Tabs
    const isEditorOpen = !editorOverlay.classList.contains('hidden');
    const isTypingInEditor = (e.target === noteTitleInput || e.target === noteBodyInput);

    if (!isEditorOpen && !isTypingInEditor) {
      const visibleNotes = getVisibleNotes();
      if (visibleNotes.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          keyboardNavIndex = (keyboardNavIndex + 1) % visibleNotes.length;
          activateTabByIndex(keyboardNavIndex, visibleNotes);
          return;
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          keyboardNavIndex = (keyboardNavIndex <= 0) ? visibleNotes.length - 1 : keyboardNavIndex - 1;
          activateTabByIndex(keyboardNavIndex, visibleNotes);
          return;
        } else if (e.key === 'Enter' && (activePeekId || keyboardNavIndex !== -1)) {
          e.preventDefault();
          const targetId = activePeekId || (visibleNotes[keyboardNavIndex] && visibleNotes[keyboardNavIndex].id);
          if (targetId) {
            hidePeekCard();
            openNoteEditor(targetId);
            playFluentSound('click');
          }
          return;
        }
      }
    }
  });

  // --- Helpers ---
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function autoLinkUrls(text) {
    const urlPattern = /(https?:\/\/[^\s<]+)/g;
    return text.replace(urlPattern, url => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="peek-link" onclick="event.stopPropagation()">${url}</a>`;
    });
  }

  function formatContentToHtml(content) {
    if (!content) return '<span style="opacity:0.5; font-style:italic">Empty note...</span>';
    const lines = content.split('\n');
    return lines.map((rawLine, idx) => {
      let indent = 0;
      let line = rawLine;
      const leadingMatch = rawLine.match(/^([ \t]+)/);
      if (leadingMatch) {
        const spaces = leadingMatch[1].replace(/\t/g, '  ').length;
        indent = Math.min(6, Math.floor(spaces / 2));
        line = rawLine.slice(leadingMatch[1].length);
      }
      const indentStyle = indent > 0 ? ` style="margin-left: ${indent * 16}px;"` : '';
      const safe = escapeHtml(line);

      // Checklist: checked item
      if (/^(\•\s*|[-]\s*)?\[[xX]\]\s*/.test(safe) || (/^(\•\s*|[-]\s*)?✓\s*/.test(safe) && !safe.startsWith('• '))) {
        const text = autoLinkUrls(safe.replace(/^(\•\s*|[-]\s*)?(\[[xX]\]|✓)\s*/, ''));
        return `<div class="peek-bullet-line interactive-check checked"${indentStyle} data-line-idx="${idx}" title="Click to uncheck">
          <span style="display:inline-flex; align-items:center; font-size:15px; margin-right:4px;">☑</span>
          <span style="text-decoration: line-through; text-decoration-thickness: 1.5px; opacity: 0.92;">${text}</span>
        </div>`;
      }
      // Checklist: unchecked item
      if (/^(\•\s*|[-]\s*)?\[\s*\]\s*/.test(safe)) {
        const text = autoLinkUrls(safe.replace(/^(\•\s*|[-]\s*)?\[\s*\]\s*/, ''));
        return `<div class="peek-bullet-line interactive-check"${indentStyle} data-line-idx="${idx}" title="Click to check">
          <span style="display:inline-flex; align-items:center; font-size:15px; margin-right:4px;">☐</span>
          <span>${text}</span>
        </div>`;
      }
      // Bullet item
      if (safe.startsWith('• ') || safe.startsWith('- ')) {
        const text = autoLinkUrls(safe.replace(/^[•-]\s*/, ''));
        const dot = getBulletSymbol(indent);
        return `<div class="peek-bullet-line"${indentStyle} data-line-idx="${idx}">
          <span class="peek-bullet-dot">${dot}</span>
          <span>${text}</span>
        </div>`;
      }
      return `<div${indentStyle}>${autoLinkUrls(safe)}</div>`;
    }).join('');
  }

  // Allow checking off items directly inside the peek card
  peekBody.addEventListener('click', (e) => {
    const checkLine = e.target.closest('.interactive-check');
    if (!checkLine) return;
    e.stopPropagation(); // prevent opening editor when toggling an item
    const lineIdx = parseInt(checkLine.dataset.lineIdx, 10);
    if (!activePeekId || isNaN(lineIdx)) return;
    const note = notes.find(n => n.id === activePeekId);
    if (!note) return;

    const lines = note.content.split('\n');
    if (lineIdx >= 0 && lineIdx < lines.length) {
      const line = lines[lineIdx];
      if (line.startsWith('[ ] ')) {
        lines[lineIdx] = line.replace('[ ] ', '[x] ');
      } else if (line.startsWith('[x] ')) {
        lines[lineIdx] = line.replace('[x] ', '[ ] ');
      } else if (line.startsWith('• ') || line.startsWith('- ')) {
        if (line.includes('✓')) {
          lines[lineIdx] = line.replace(' ✓', '');
        } else {
          lines[lineIdx] = line + ' ✓';
        }
      }
      note.content = lines.join('\n');
      note.updatedAt = Date.now();
      saveNotes();
      peekBody.innerHTML = formatContentToHtml(note.content);
      peekTimestamp.textContent = formatRelativeTime(note.updatedAt);
      renderPinnedNotes();
      playFluentSound('click');
    }
  });

  // --- Dynamic Window Resizing (Eliminates the Click Barrier) ---
  function expandNativeWindow() {
    if (window.pywebview && window.pywebview.api && window.pywebview.api.expand_window) {
      window.pywebview.api.expand_window();
    }
  }

  function collapseNativeWindow() {
    if (!editorOverlay.classList.contains('hidden')) return;
    if (activePeekId) return;
    const searchPopup = document.getElementById('dock-search-popup');
    if (searchPopup && !searchPopup.classList.contains('hidden')) return;
    if (window.pywebview && window.pywebview.api && window.pywebview.api.collapse_window) {
      window.pywebview.api.collapse_window();
    }
  }

  // --- Native Desktop Widget & Electron/PyWebView Integration ---
  const urlParams = new URLSearchParams(window.location.search);
  const isWidgetParam = urlParams.get('mode') === 'widget';
  const isElectron = !!(window.electronAPI && window.electronAPI.isElectron);
  const isNativeWidget = isElectron || isWidgetParam || (window.location.protocol === 'file:') || (window.pywebview !== undefined);
  const btnWidgetToggle = document.getElementById('btn-widget-toggle');

  const btnWidgetNewNote = document.getElementById('btn-widget-new-note');
  const widgetNoteSwitcher = document.getElementById('widget-note-switcher');

  function updateWidgetNoteSwitcher(activeId) {
    if (!widgetNoteSwitcher) return;
    widgetNoteSwitcher.innerHTML = '<option value="" disabled selected>📋 Notes</option>';
    notes.forEach(note => {
      const opt = document.createElement('option');
      opt.value = note.id;
      opt.textContent = `📝 ${(note.title || 'Untitled note').substring(0, 18)}`;
      widgetNoteSwitcher.appendChild(opt);
    });
  }

  const btnDockExit = document.getElementById('btn-dock-exit');
  const btnDockSearch = document.getElementById('btn-dock-search');
  const dockSearchPopup = document.getElementById('dock-search-popup');
  const dockSearchInput = document.getElementById('dock-search-input');
  const btnDockSearchClose = document.getElementById('btn-dock-search-close');

  function setupNativeWidgetMode() {
    // In Electron, handle mouse enter / leave for click-through
    if (window.electronAPI && window.electronAPI.isElectron) {
      if (winEdgeDock) {
        winEdgeDock.addEventListener('mouseenter', () => {
          if (!isDockCollapsed) {
            window.electronAPI.setIgnoreMouseEvents(false);
          }
        });
        winEdgeDock.addEventListener('mouseleave', () => {
          if (editorOverlay.classList.contains('hidden')) {
            window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
          }
        });
      }

      if (window.electronAPI.onToggleCollapse) {
        window.electronAPI.onToggleCollapse(() => {
          toggleDockCollapse();
        });
      }

      if (window.electronAPI.onToggleDockSide) {
        window.electronAPI.onToggleDockSide(() => {
          const newSide = currentDockSide === 'right' ? 'left' : 'right';
          applyDockSide(newSide);
          appState.dockSide = newSide;
          saveAppState();
        });
      }

      if (peekCard) {
        peekCard.addEventListener('mouseenter', () => {
          window.electronAPI.setIgnoreMouseEvents(false);
        });
        peekCard.addEventListener('mouseleave', () => {
          if (editorOverlay.classList.contains('hidden')) {
            window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
          }
        });
      }

      // Start with transparent areas click-through
      window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
    }

    // Dock search popover
    if (btnDockSearch && dockSearchPopup && dockSearchInput) {
      btnDockSearch.addEventListener('click', () => {
        if (window.electronAPI && window.electronAPI.isElectron) {
          window.electronAPI.setIgnoreMouseEvents(false);
        }
        dockSearchPopup.classList.toggle('hidden');
        if (!dockSearchPopup.classList.contains('hidden')) {
          dockSearchInput.focus();
        }
      });

      dockSearchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        renderDockTabs();
      });

      if (dockTagChips) {
        dockTagChips.addEventListener('click', (e) => {
          const chip = e.target.closest('.tag-chip');
          if (!chip) return;
          playFluentSound('click');
          dockTagChips.querySelectorAll('.tag-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          currentTagFilter = chip.dataset.tag || 'all';
          keyboardNavIndex = -1;
          renderDockTabs();
        });
      }

      if (btnDockSearchClose) {
        btnDockSearchClose.addEventListener('click', () => {
          dockSearchPopup.classList.add('hidden');
          dockSearchInput.value = '';
          searchQuery = '';
          currentTagFilter = 'all';
          if (dockTagChips) {
            dockTagChips.querySelectorAll('.tag-chip').forEach(c => c.classList.remove('active'));
            const allChip = dockTagChips.querySelector('[data-tag="all"]');
            if (allChip) allChip.classList.add('active');
          }
          renderDockTabs();
        });
      }
    }

    // Exit widget button
    if (btnDockExit) {
      btnDockExit.addEventListener('click', () => {
        if (window.electronAPI && window.electronAPI.quitApp) {
          window.electronAPI.quitApp();
        } else {
          window.close();
        }
      });
    }

    // Toggle Always On Top button
    const btnDockPin = document.getElementById('btn-dock-pin');
    let isAlwaysOnTop = true;
    if (btnDockPin) {
      btnDockPin.addEventListener('click', (e) => {
        e.stopPropagation();
        isAlwaysOnTop = !isAlwaysOnTop;
        btnDockPin.classList.toggle('active', isAlwaysOnTop);
        btnDockPin.title = isAlwaysOnTop ? 'Always On Top: Pinned (Click to unpin)' : 'Always On Top: Unpinned (Click to pin)';
        if (window.electronAPI && window.electronAPI.setAlwaysOnTop) {
          window.electronAPI.setAlwaysOnTop(isAlwaysOnTop);
        }
        playFluentSound('click');
        showEditorSaveToast(isAlwaysOnTop ? '📌 Pinned: Always on top' : '🔓 Unpinned: Normal desktop window');
      });
    }

    // Copy note text to clipboard
    const btnCopyNote = document.getElementById('btn-copy-note');
    if (btnCopyNote) {
      btnCopyNote.addEventListener('click', () => {
        if (!currentEditingId) return;
        const note = notes.find(n => n.id === currentEditingId);
        if (!note) return;
        const fullText = `# ${note.title}\n\n${note.content}`;
        navigator.clipboard.writeText(fullText).then(() => {
          const origText = btnCopyNote.textContent;
          btnCopyNote.textContent = '✓ Copied!';
          playFluentSound('save');
          setTimeout(() => { btnCopyNote.textContent = origText; }, 1500);
        });
      });
    }

    // Export note as Markdown (.md)
    const btnExportNote = document.getElementById('btn-export-note');
    if (btnExportNote) {
      btnExportNote.addEventListener('click', () => {
        if (!currentEditingId) return;
        const note = notes.find(n => n.id === currentEditingId);
        if (!note) return;
        const mdContent = `# ${note.title}\n\n${note.content}\n\n*Created with Windows 11 Sticky Notes Widget*`;
        const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${note.title.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'note'}.md`;
        a.click();
        URL.revokeObjectURL(url);
        playFluentSound('save');
      });
    }

    if (btnCaptionClose) {
      btnCaptionClose.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeNoteEditor();
      });
    }

    if (btnCaptionMinimize) {
      btnCaptionMinimize.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeNoteEditor();
      });
    }

    if (isNativeWidget) {
      document.body.classList.add('native-widget-mode');

      if (isElectron) {
        window.electronAPI.onNewNoteTrigger(() => {
          const note = createNewNote();
          openNoteEditor(note.id);
        });

        if (window.electronAPI.onToggleSoundTrigger) {
          window.electronAPI.onToggleSoundTrigger(() => {
            toggleSound();
          });
        }

        if (window.electronAPI.onBeforeQuit) {
          window.electronAPI.onBeforeQuit(() => {
            flushSave();
            saveAppState();
          });
        }
      }
    } else {
      // Browser mode: Widget Mode button toggles transparent desktop overlay
      if (btnWidgetToggle) {
        btnWidgetToggle.addEventListener('click', () => {
          const isWidget = document.body.classList.toggle('native-widget-mode');
          if (isWidget) {
            createBrowserExitPill();
          } else {
            removeBrowserExitPill();
          }
        });
      }
    }
  }

  function createBrowserExitPill() {
    if (document.getElementById('browser-widget-exit')) return;
    const pill = document.createElement('button');
    pill.id = 'browser-widget-exit';
    pill.className = 'widget-exit-pill';
    pill.innerHTML = `✕ Exit Widget Mode`;
    pill.addEventListener('click', () => {
      document.body.classList.remove('native-widget-mode');
      removeBrowserExitPill();
    });
    document.body.appendChild(pill);
  }

  function removeBrowserExitPill() {
    const pill = document.getElementById('browser-widget-exit');
    if (pill) pill.remove();
  }

  // Wire Undo Delete Button & Dismiss
  const btnUndoDelete = document.getElementById('btn-undo-delete');
  const btnToastDismiss = document.getElementById('btn-toast-dismiss');
  if (btnUndoDelete) {
    btnUndoDelete.addEventListener('click', () => {
      undoDelete();
    });
  }
  if (btnToastDismiss) {
    btnToastDismiss.addEventListener('click', () => {
      const toast = document.getElementById('undo-toast');
      if (toast) toast.classList.add('hidden');
    });
  }

  // --- Keyboard Shortcuts ---
  window.addEventListener('keydown', (e) => {
    // Ctrl + Shift + Q: Exit widget
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'q') {
      e.preventDefault();
      if (btnDockExit) btnDockExit.click();
    }
  });

  // --- System Tray IPC Handlers ---
  window.createNewNoteFromTray = () => {
    expandNativeWindow();
    const note = createNewNote();
    openNoteEditor(note.id);
  };

  window.openNoteByTitleOrFirst = (title) => {
    expandNativeWindow();
    const note = notes.find(n => n.title.toLowerCase() === title.toLowerCase()) || notes[0];
    if (note) {
      openNoteEditor(note.id);
    }
  };

  window.toggleDockVisibility = () => {
    if (!editorOverlay.classList.contains('hidden')) {
      closeNoteEditor();
    } else {
      expandNativeWindow();
      if (notes.length > 0) {
        openNoteEditor(notes[0].id);
      } else {
        createNewNote();
      }
    }
  };

  // --- Initialization ---
  loadNotes();
  applyDockSide(currentDockSide);
  renderDockTabs();
  updateSoundUI();
  setupNativeWidgetMode();
  updateClock();
  setInterval(updateClock, 1000);

})();
