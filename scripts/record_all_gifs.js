const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const FRAMES_ROOT = path.join(ROOT_DIR, 'temp_frames');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');

if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

function ensureFramesDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

app.whenReady().then(async () => {
  console.log('🚀 Launching Electron for GIF recording...');
  const win = new BrowserWindow({
    width: 1080,
    height: 640,
    show: false,
    webPreferences: {
      offscreen: false
    }
  });

  await win.loadURL('http://localhost:8080/index.html');
  await sleep(1500);

  // Inject sleek virtual cursor into page
  await win.webContents.executeJavaScript(`
    (() => {
      const cursor = document.createElement('div');
      cursor.id = 'fluent-virtual-cursor';
      cursor.innerHTML = \`
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.6)); pointer-events: none;">
          <path d="M4 2L17.5 13.5L11.5 14.5L9.5 20.5L6.5 19.5L8.5 14L4 11.5L4 2Z" fill="#ffffff" stroke="#111111" stroke-width="1.6" stroke-linejoin="round"/>
        </svg>
      \`;
      cursor.style.position = 'fixed';
      cursor.style.zIndex = '9999999';
      cursor.style.left = '500px';
      cursor.style.top = '300px';
      cursor.style.pointerEvents = 'none';
      cursor.style.transition = 'left 0.22s cubic-bezier(0.2, 0, 0, 1), top 0.22s cubic-bezier(0.2, 0, 0, 1), transform 0.15s ease';
      document.body.appendChild(cursor);

      window.setCursorPos = (x, y, clicking = false) => {
        cursor.style.left = x + 'px';
        cursor.style.top = y + 'px';
        cursor.style.transform = clicking ? 'scale(0.82)' : 'scale(1)';
      };

      window.getElementCenter = (selector) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return { x: Math.round(rect.left + rect.width / 2), y: Math.round(rect.top + rect.height / 2) };
      };
    })();
  `);

  async function moveCursor(x, y, clicking = false) {
    if (!x || !y) return;
    await win.webContents.executeJavaScript(`window.setCursorPos(${x}, ${y}, ${clicking})`);
    await sleep(220);
  }

  async function captureFrame(dir, index) {
    const img = await win.webContents.capturePage();
    const framePath = path.join(dir, `frame_${String(index).padStart(4, '0')}.png`);
    fs.writeFileSync(framePath, img.toPNG());
  }

  // ==========================================
  // SCENARIO 1: HERO OVERVIEW
  // ==========================================
  console.log('🎥 Recording 1/4: Hero Overview...');
  const heroDir = path.join(FRAMES_ROOT, 'hero');
  ensureFramesDir(heroDir);
  let frameIdx = 0;

  // Initial state
  await moveCursor(520, 320);
  for (let i = 0; i < 3; i++) {
    await captureFrame(heroDir, frameIdx++);
    await sleep(100);
  }

  // Hover over first tab
  const tab1Pos = await win.webContents.executeJavaScript(`window.getElementCenter('.dock-tab-item:nth-child(1)')`);
  if (tab1Pos) {
    await moveCursor(tab1Pos.x - 40, tab1Pos.y);
    await win.webContents.executeJavaScript(`document.querySelector('.dock-tab-item:nth-child(1)')?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))`);
    for (let i = 0; i < 4; i++) {
      await captureFrame(heroDir, frameIdx++);
      await sleep(120);
    }
  }

  // Hover over second tab
  const tab2Pos = await win.webContents.executeJavaScript(`window.getElementCenter('.dock-tab-item:nth-child(2)')`);
  if (tab2Pos) {
    await moveCursor(tab2Pos.x - 40, tab2Pos.y);
    await win.webContents.executeJavaScript(`
      document.querySelector('.dock-tab-item:nth-child(1)')?.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      document.querySelector('.dock-tab-item:nth-child(2)')?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    `);
    for (let i = 0; i < 4; i++) {
      await captureFrame(heroDir, frameIdx++);
      await sleep(120);
    }
  }

  // Hover over third tab
  const tab3Pos = await win.webContents.executeJavaScript(`window.getElementCenter('.dock-tab-item:nth-child(3)')`);
  if (tab3Pos) {
    await moveCursor(tab3Pos.x - 40, tab3Pos.y);
    await win.webContents.executeJavaScript(`
      document.querySelector('.dock-tab-item:nth-child(2)')?.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      document.querySelector('.dock-tab-item:nth-child(3)')?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    `);
    for (let i = 0; i < 4; i++) {
      await captureFrame(heroDir, frameIdx++);
      await sleep(120);
    }

    // Click third tab to open editor modal
    await moveCursor(tab3Pos.x, tab3Pos.y, true);
    await captureFrame(heroDir, frameIdx++);
    await win.webContents.executeJavaScript(`document.querySelector('.dock-tab-item:nth-child(3)')?.click()`);
    await sleep(250);
    await moveCursor(tab3Pos.x, tab3Pos.y, false);

    for (let i = 0; i < 4; i++) {
      await captureFrame(heroDir, frameIdx++);
      await sleep(120);
    }

    // Move to color swatches inside editor modal
    const swatchPos = await win.webContents.executeJavaScript(`window.getElementCenter('.palette-swatch:nth-child(4)')`);
    if (swatchPos) {
      await moveCursor(swatchPos.x, swatchPos.y);
      await moveCursor(swatchPos.x, swatchPos.y, true);
      await win.webContents.executeJavaScript(`document.querySelector('.palette-swatch:nth-child(4)')?.click()`);
      await captureFrame(heroDir, frameIdx++);
      await sleep(150);
      await moveCursor(swatchPos.x, swatchPos.y, false);
      for (let i = 0; i < 2; i++) {
        await captureFrame(heroDir, frameIdx++);
        await sleep(100);
      }
    }

    // Close editor
    const closePos = await win.webContents.executeJavaScript(`window.getElementCenter('#btn-caption-close') || window.getElementCenter('#btn-close-note')`);
    if (closePos) {
      await moveCursor(closePos.x, closePos.y);
      await moveCursor(closePos.x, closePos.y, true);
      await win.webContents.executeJavaScript(`(document.querySelector('#btn-caption-close') || document.querySelector('#btn-close-note'))?.click()`);
      await sleep(250);
      await moveCursor(closePos.x, closePos.y, false);
      for (let i = 0; i < 3; i++) {
        await captureFrame(heroDir, frameIdx++);
        await sleep(100);
      }
    }
  }

  // Convert Hero Frames to GIF
  console.log('✨ Converting Hero frames to GIF...');
  const heroGifPath = path.join(ASSETS_DIR, 'fluent-hero-overview.gif');
  execSync(`python scripts/frames_to_gif.py "${heroDir}" "${heroGifPath}" 840 10`, { stdio: 'inherit' });

  // ==========================================
  // SCENARIO 2: EDGE DOCK ERGONOMICS (Collapse & Reposition)
  // ==========================================
  console.log('🎥 Recording 2/4: Edge Dock Ergonomics...');
  const dockDir = path.join(FRAMES_ROOT, 'dock');
  ensureFramesDir(dockDir);
  frameIdx = 0;

  // Move to collapse button
  const collapseBtnPos = await win.webContents.executeJavaScript(`window.getElementCenter('#btn-dock-collapse')`);
  if (collapseBtnPos) {
    await moveCursor(collapseBtnPos.x, collapseBtnPos.y);
    for (let i = 0; i < 2; i++) { await captureFrame(dockDir, frameIdx++); await sleep(100); }
    
    // Click collapse
    await moveCursor(collapseBtnPos.x, collapseBtnPos.y, true);
    await captureFrame(dockDir, frameIdx++);
    await win.webContents.executeJavaScript(`document.querySelector('#btn-dock-collapse')?.click()`);
    await sleep(300);
    await moveCursor(collapseBtnPos.x, collapseBtnPos.y, false);
    
    // Show collapsed state with click-through screen space
    for (let i = 0; i < 6; i++) { await captureFrame(dockDir, frameIdx++); await sleep(120); }

    // Move to expand pill
    const pillPos = await win.webContents.executeJavaScript(`window.getElementCenter('#dock-expand-pill')`);
    if (pillPos) {
      await moveCursor(pillPos.x, pillPos.y);
      for (let i = 0; i < 2; i++) { await captureFrame(dockDir, frameIdx++); await sleep(100); }
      await moveCursor(pillPos.x, pillPos.y, true);
      await captureFrame(dockDir, frameIdx++);
      await win.webContents.executeJavaScript(`document.querySelector('#dock-expand-pill')?.click()`);
      await sleep(300);
      await moveCursor(pillPos.x, pillPos.y, false);
      for (let i = 0; i < 4; i++) { await captureFrame(dockDir, frameIdx++); await sleep(120); }
    }
  }

  // Switch dock side to LEFT
  const sideBtnPos = await win.webContents.executeJavaScript(`window.getElementCenter('#btn-toggle-dock-side')`);
  if (sideBtnPos) {
    await moveCursor(sideBtnPos.x, sideBtnPos.y);
    for (let i = 0; i < 2; i++) { await captureFrame(dockDir, frameIdx++); await sleep(100); }
    await moveCursor(sideBtnPos.x, sideBtnPos.y, true);
    await captureFrame(dockDir, frameIdx++);
    await win.webContents.executeJavaScript(`document.querySelector('#btn-toggle-dock-side')?.click()`);
    await sleep(300);
    await moveCursor(sideBtnPos.x, sideBtnPos.y, false);
    for (let i = 0; i < 5; i++) { await captureFrame(dockDir, frameIdx++); await sleep(120); }

    // Hover tab on the left
    const leftTabPos = await win.webContents.executeJavaScript(`window.getElementCenter('.dock-tab-item:nth-child(1)')`);
    if (leftTabPos) {
      await moveCursor(leftTabPos.x + 40, leftTabPos.y);
      await win.webContents.executeJavaScript(`document.querySelector('.dock-tab-item:nth-child(1)')?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))`);
      for (let i = 0; i < 4; i++) { await captureFrame(dockDir, frameIdx++); await sleep(120); }
      await win.webContents.executeJavaScript(`document.querySelector('.dock-tab-item:nth-child(1)')?.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))`);
    }

    // Switch back to RIGHT side
    const leftSideBtnPos = await win.webContents.executeJavaScript(`window.getElementCenter('#btn-toggle-dock-side')`);
    if (leftSideBtnPos) {
      await moveCursor(leftSideBtnPos.x, leftSideBtnPos.y);
      await moveCursor(leftSideBtnPos.x, leftSideBtnPos.y, true);
      await win.webContents.executeJavaScript(`document.querySelector('#btn-toggle-dock-side')?.click()`);
      await sleep(300);
      await moveCursor(leftSideBtnPos.x, leftSideBtnPos.y, false);
      for (let i = 0; i < 3; i++) { await captureFrame(dockDir, frameIdx++); await sleep(100); }
    }
  }

  // Convert Dock Frames to GIF
  console.log('✨ Converting Dock Ergonomics frames to GIF...');
  const dockGifPath = path.join(ASSETS_DIR, 'fluent-dock-ergonomics.gif');
  execSync(`python scripts/frames_to_gif.py "${dockDir}" "${dockGifPath}" 840 10`, { stdio: 'inherit' });

  // ==========================================
  // SCENARIO 3: INTERACTIVE CHECKLISTS & TASKS
  // ==========================================
  console.log('🎥 Recording 3/4: Interactive Checklists...');
  const checkDir = path.join(FRAMES_ROOT, 'checklist');
  ensureFramesDir(checkDir);
  frameIdx = 0;

  // Open note 3 with rich checklists
  const checkTabPos = await win.webContents.executeJavaScript(`window.getElementCenter('.dock-tab-item:nth-child(3)')`);
  if (checkTabPos) {
    await moveCursor(checkTabPos.x, checkTabPos.y);
    await win.webContents.executeJavaScript(`document.querySelector('.dock-tab-item:nth-child(3)')?.click()`);
    await sleep(250);
    for (let i = 0; i < 4; i++) { await captureFrame(checkDir, frameIdx++); await sleep(100); }

    // Toggle checklist checkboxes inside the modal
    await win.webContents.executeJavaScript(`
      const body = document.querySelector('#note-body-input');
      if (body) {
        body.focus();
        body.value += '\\n[x] Automated testing passed!\\n[ ] Ship v1.0.0 release candidate';
        body.dispatchEvent(new Event('input', { bubbles: true }));
      }
    `);
    await sleep(200);
    for (let i = 0; i < 5; i++) { await captureFrame(checkDir, frameIdx++); await sleep(120); }

    // Click Save Button
    const saveBtnPos = await win.webContents.executeJavaScript(`window.getElementCenter('#btn-manual-save-bottom')`);
    if (saveBtnPos) {
      await moveCursor(saveBtnPos.x, saveBtnPos.y);
      await moveCursor(saveBtnPos.x, saveBtnPos.y, true);
      await win.webContents.executeJavaScript(`document.querySelector('#btn-manual-save-bottom')?.click()`);
      await sleep(200);
      await moveCursor(saveBtnPos.x, saveBtnPos.y, false);
      for (let i = 0; i < 4; i++) { await captureFrame(checkDir, frameIdx++); await sleep(120); }
    }

    // Close modal
    const closeBtnPos = await win.webContents.executeJavaScript(`window.getElementCenter('#btn-caption-close') || window.getElementCenter('#btn-close-note')`);
    if (closeBtnPos) {
      await moveCursor(closeBtnPos.x, closeBtnPos.y);
      await win.webContents.executeJavaScript(`(document.querySelector('#btn-caption-close') || document.querySelector('#btn-close-note'))?.click()`);
      await sleep(200);
      for (let i = 0; i < 3; i++) { await captureFrame(checkDir, frameIdx++); await sleep(100); }
    }

    // Hover tab to show updated checklist preview card with checked off items!
    await moveCursor(checkTabPos.x - 40, checkTabPos.y);
    await win.webContents.executeJavaScript(`document.querySelector('.dock-tab-item:nth-child(3)')?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))`);
    for (let i = 0; i < 6; i++) { await captureFrame(checkDir, frameIdx++); await sleep(120); }
    await win.webContents.executeJavaScript(`document.querySelector('.dock-tab-item:nth-child(3)')?.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))`);
  }

  // Convert Checklist Frames to GIF
  console.log('✨ Converting Checklist frames to GIF...');
  const checkGifPath = path.join(ASSETS_DIR, 'fluent-interactive-checklists.gif');
  execSync(`python scripts/frames_to_gif.py "${checkDir}" "${checkGifPath}" 840 10`, { stdio: 'inherit' });

  // ==========================================
  // SCENARIO 4: THEMES & WALLPAPERS CUSTOMIZATION
  // ==========================================
  console.log('🎥 Recording 4/4: Themes & Wallpapers Customization...');
  const themeDir = path.join(FRAMES_ROOT, 'theme');
  ensureFramesDir(themeDir);
  frameIdx = 0;

  // Move to Theme Toggle button in topbar
  const themePos = await win.webContents.executeJavaScript(`window.getElementCenter('#btn-theme-toggle')`);
  if (themePos) {
    await moveCursor(themePos.x, themePos.y);
    await moveCursor(themePos.x, themePos.y, true);
    await captureFrame(themeDir, frameIdx++);
    await win.webContents.executeJavaScript(`document.querySelector('#btn-theme-toggle')?.click()`);
    await sleep(250);
    await moveCursor(themePos.x, themePos.y, false);
    for (let i = 0; i < 5; i++) { await captureFrame(themeDir, frameIdx++); await sleep(120); }
  }

  // Hover over tabs in Light Theme to show sleek frosted glass
  if (tab1Pos) {
    await moveCursor(tab1Pos.x - 40, tab1Pos.y);
    await win.webContents.executeJavaScript(`document.querySelector('.dock-tab-item:nth-child(1)')?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))`);
    for (let i = 0; i < 4; i++) { await captureFrame(themeDir, frameIdx++); await sleep(120); }
    await win.webContents.executeJavaScript(`document.querySelector('.dock-tab-item:nth-child(1)')?.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))`);
  }

  // Move to Wallpaper Toggle button
  const wpPos = await win.webContents.executeJavaScript(`window.getElementCenter('#btn-wallpaper-toggle')`);
  if (wpPos) {
    await moveCursor(wpPos.x, wpPos.y);
    await moveCursor(wpPos.x, wpPos.y, true);
    await captureFrame(themeDir, frameIdx++);
    await win.webContents.executeJavaScript(`document.querySelector('#btn-wallpaper-toggle')?.click()`);
    await sleep(250);
    await moveCursor(wpPos.x, wpPos.y, false);
    for (let i = 0; i < 5; i++) { await captureFrame(themeDir, frameIdx++); await sleep(120); }

    // Cycle wallpaper again
    await moveCursor(wpPos.x, wpPos.y, true);
    await captureFrame(themeDir, frameIdx++);
    await win.webContents.executeJavaScript(`document.querySelector('#btn-wallpaper-toggle')?.click()`);
    await sleep(250);
    await moveCursor(wpPos.x, wpPos.y, false);
    for (let i = 0; i < 5; i++) { await captureFrame(themeDir, frameIdx++); await sleep(120); }
  }

  // Switch back to Dark Theme
  if (themePos) {
    await moveCursor(themePos.x, themePos.y);
    await moveCursor(themePos.x, themePos.y, true);
    await captureFrame(themeDir, frameIdx++);
    await win.webContents.executeJavaScript(`document.querySelector('#btn-theme-toggle')?.click()`);
    await sleep(250);
    await moveCursor(themePos.x, themePos.y, false);
    for (let i = 0; i < 4; i++) { await captureFrame(themeDir, frameIdx++); await sleep(100); }
  }

  // Convert Theme frames to GIF
  console.log('✨ Converting Theme & Wallpaper frames to GIF...');
  const themeGifPath = path.join(ASSETS_DIR, 'fluent-themes-wallpapers.gif');
  execSync(`python scripts/frames_to_gif.py "${themeDir}" "${themeGifPath}" 840 10`, { stdio: 'inherit' });

  // Clean up temp_frames
  try {
    fs.rmSync(FRAMES_ROOT, { recursive: true, force: true });
    console.log('🧹 Cleaned up temporary frames directory.');
  } catch (e) {}

  console.log('\n🎉 ALL 4 GIF RECORDINGS COMPLETED SUCCESSFULLY!');
  app.quit();
});
