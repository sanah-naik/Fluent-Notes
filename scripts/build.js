const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const APP_OUT_DIR = path.join(DIST_DIR, 'StickyNotes-win32-x64');
const ELECTRON_DIST = path.join(ROOT_DIR, 'node_modules', 'electron', 'dist');

console.log('🚀 Packaging Windows 11 Fluent Sticky Notes...');

// 1. Ensure clean dist directory
if (fs.existsSync(APP_OUT_DIR)) {
  fs.rmSync(APP_OUT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(APP_OUT_DIR, { recursive: true });

// 2. Copy Electron runtime binaries
console.log('📦 Copying Electron runtime binaries from local cache...');
fs.cpSync(ELECTRON_DIST, APP_OUT_DIR, { recursive: true });

// 3. Rename executable to Sticky Notes.exe
const defaultExe = path.join(APP_OUT_DIR, 'electron.exe');
const targetExe = path.join(APP_OUT_DIR, 'Sticky Notes.exe');
if (fs.existsSync(defaultExe)) {
  fs.renameSync(defaultExe, targetExe);
}

// 4. Create resources/app directory for clean packaging
const resourcesApp = path.join(APP_OUT_DIR, 'resources', 'app');
fs.mkdirSync(resourcesApp, { recursive: true });

// 5. Copy necessary app files (excluding node_modules, git, personal notes)
const filesToCopy = [
  'main.js',
  'preload.js',
  'app.js',
  'index.html',
  'styles.css',
  'sticky_notes_cute.ico',
  'sticky_notes_cute.png',
  'tray_icon.ico',
  'tray_icon.png',
  'notes.example.json',
  'README.md'
];

console.log('📄 Copying production application assets...');
for (const file of filesToCopy) {
  const src = path.join(ROOT_DIR, file);
  const dest = path.join(resourcesApp, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

// Write a clean production package.json into resources/app
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
const prodPkg = {
  name: pkg.name,
  productName: pkg.productName || 'Sticky Notes',
  version: pkg.version || '1.0.0',
  description: pkg.description,
  main: 'main.js',
  author: pkg.author,
  license: pkg.license
};
fs.writeFileSync(path.join(resourcesApp, 'package.json'), JSON.stringify(prodPkg, null, 2), 'utf8');

// 6. Copy icon to root of distribution for convenient shortcut creation
if (fs.existsSync(path.join(ROOT_DIR, 'sticky_notes_cute.ico'))) {
  fs.copyFileSync(path.join(ROOT_DIR, 'sticky_notes_cute.ico'), path.join(APP_OUT_DIR, 'app.ico'));
}

// 7. Create a launch helper script in distribution root
const batContent = `@echo off\r\nstart "" "%~dp0Sticky Notes.exe"\r\n`;
fs.writeFileSync(path.join(APP_OUT_DIR, 'Launch Sticky Notes.bat'), batContent, 'utf8');

console.log('✅ Standalone package built successfully at:');
console.log(APP_OUT_DIR);

// 8. Create compressed distribution zip archive for easy sharing
const zipTarget = path.join(DIST_DIR, `StickyNotes-v${pkg.version || '1.0.0'}-win64.zip`);
console.log(`🗜️ Compressing standalone package to ${path.basename(zipTarget)}...`);
try {
  if (fs.existsSync(zipTarget)) {
    fs.unlinkSync(zipTarget);
  }
  execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${APP_OUT_DIR}\\*' -DestinationPath '${zipTarget}' -CompressionLevel Optimal"`, { stdio: 'inherit' });
  console.log(`🎉 Compressed release created: ${zipTarget}`);
} catch (err) {
  console.warn('Zip compression warning:', err.message);
}

console.log('\n✨ Done! Ready for distribution to the world!');
