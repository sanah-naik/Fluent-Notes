# 📌 Fluent Notes · Windows 11 Edge-Docked Sticky Notes Widget

<p align="center">
  <img src="sticky_notes_cute.png" alt="Sticky Notes Icon" width="100" height="100" />
</p>

<p align="center">
  <strong>A modern, unobtrusive edge-docked sticky notes widget designed with Windows 11 Fluent Mica/Acrylic aesthetics.</strong><br>
  <em>Pin to your screen edge, collapse for 100% click-through access, drag anywhere, and never lose your thoughts again.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Windows%2011%20%7C%2010-0078D4?style=for-the-badge&logo=windows11&logoColor=white" alt="Windows" />
  <img src="https://img.shields.io/badge/Framework-Electron-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/Design-Fluent%20Acrylic-9B51E0?style=for-the-badge" alt="Fluent" />
  <img src="https://img.shields.io/badge/License-MIT-success?style=for-the-badge" alt="License" />
</p>

---

## 🌟 Why This Widget?

Most desktop sticky note applications clutter your screen, cover important browser tabs, block window scrollbars, or look like relic software from 2005.

**Windows 11 Fluent Sticky Notes** solves this with an edge-docked ergonomic design:
- 🪟 **Always Available, Never in the Way**: Sticks cleanly to your screen edge with smooth acrylic tabs.
- 💨 **100% Click-Through Behind the Dock**: Collapse the dock with a single click or `Ctrl+Alt+H`. When collapsed, mouse clicks pass through completely to underlying browsers, documents, and games.
- 🎯 **Total Positional Freedom**: Drag the dock vertically along the bezel to your sweet spot, or switch between **Right Edge** and **Left Edge** in 1 click.
- 🎨 **Calming Pastel Aesthetics**: Carefully curated pastel colorways tailored for readability and visual calm.
- 🔒 **Interactive Checklist & Password Vaults**: Checklists you can tick off interactively, and encrypted password cards with 1-click clipboard copy.
- 🛡️ **Zero-Loss Auto-Save**: Instant atomic persistence with automated backup mirrors.

---

## ✨ Key Features

### 1. 🪟 Unobstructed Screen Access
- **1-Click Collapse (`Ctrl+Alt+H` or Chevron button)**: Instantly folds the dock into the screen bezel.
- **Native Click-Through (`setIgnoreMouseEvents`)**: When collapsed, the window becomes transparent to mouse events—you can click buttons, highlight text, and scroll pages directly behind it without any obstruction.
- **Micro Expand Pill**: A sleek, unobtrusive `NOTES` pill hugs the bezel. Hover or click anytime to expand back.

### 2. ⇄ Move & Reposition Anywhere
- **Vertical Grip Handle (`:::`)**: Click and drag up or down along the bezel to place the dock at any height.
- **Double-Click Re-Center**: Double-click the grip handle to instantly snap the dock back to the screen center (`50%`).
- **Edge Switcher (`⇄` Button)**: Swap between the **Right Edge** and **Left Edge** in one click (ideal for avoiding browser scrollbars or multi-monitor setups).
- **Session Memory**: Dock position, screen edge, and collapsed state are remembered across restarts in `app_state.json`.

### 3. 📝 Rich Note Types
- **Standard Notes**: Clean typography with Markdown support, bullet lists, and fluid auto-sizing text areas.
- **Interactive Checklists**: Todo lists with clickable checkboxes directly in the note preview card as well as the editor.
- **Secure Password Vault**: Dedicated password cards with hidden asterisks, peek toggle (`👁️`), and instant 1-click copy with visual toast confirmation.

### 4. 🎨 Curated Pastel Palette
Choose from soothing, elegant pastel shades designed to look stunning on both Light and Dark Windows 11 themes:
- 🌸 **Pastel Rose**
- 💜 **Lavender Whisper**
- 🌿 **Mint Serenity**
- 🌊 **Sky Blue**
- 🧈 **Buttercream Cream**
- 🍑 **Peach Glow**
- 🐘 **Slate Elegance**

### 5. 🛡️ Rock-Solid Data Safety
- **Continuous Auto-Save**: Saves silently while you type with debounced disk writes.
- **Dual Persistence Mirror**: Primary `notes.json` is paired with an automatic `notes_backup.json` to prevent accidental corruption.
- **Safe Note Deletion**: Integrated deletion buttons with confirmation safeguards.

### 6. 🎛️ Windows Tray Integration & Global Shortcuts
- Access options anytime from the Windows System Tray icon.
- Toggle visibility globally with hotkeys.
- Optional 1-click script to run automatically on Windows startup.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + Alt + H` | **Collapse / Expand Edge Dock** (Global hotkey) |
| `Ctrl + S` | Force Save Active Note in Editor |
| `Escape` | Close Editor Modal / Dismiss Dialogs |
| `Ctrl + F` | Focus Search Bar |
| `Double Click (:::)` | Reset Dock to Vertical Center |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- Windows 10 or Windows 11

### Installation from Source

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sanah-naik/Fluent-Notes.git
   cd Fluent-Notes
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the application:**
   ```bash
   npm start
   ```

---

## 📦 Packaging & Distribution

You can generate production-ready standalone Windows releases with zero external runtime requirements:

### 1. Build Standalone Release & Compressed Archive (Recommended)
Generates the complete portable Windows x64 binary directory (`dist/StickyNotes-win32-x64/`) and a distribution zip archive (`dist/StickyNotes-v1.0.0-win64.zip`):
```bash
npm run build
```
*(or `npm run package`)*

Anyone on Windows 10/11 can simply extract the `.zip` and double-click **`Sticky Notes.exe`**—no Node.js, no terminal, and no installer needed!

### 2. Output Artifacts in `dist/`
- 📁 **`dist/StickyNotes-win32-x64/`**: Fully unpacked portable application folder ready to run.
- 🗜️ **`dist/StickyNotes-v1.0.0-win64.zip`**: Compressed release package ready to upload to GitHub Releases, GitLab Releases, or share with users.

---

## 🚀 Auto-Start on Windows Boot (Optional)

To have Sticky Notes start automatically when you log into Windows:
- Double-click **`Enable-Auto-Start-On-Boot.bat`** in the project folder.
- To disable it anytime, run **`Disable-Auto-Start-On-Boot.bat`**.

---

## 📂 Project Architecture

```
Sticky_Notes_Tool/
├── index.html            # Main UI, acrylic edge dock & editor modal markup
├── styles.css            # Windows 11 Fluent design system & micro-animations
├── app.js                # Note state, drag mechanics, checklist rendering & UI logic
├── main.js               # Electron main process, tray menu, window click-through
├── preload.js            # Secure context bridge between Electron and UI
├── package.json          # Project metadata, scripts, and build configurations
├── sticky_notes_cute.ico # Application icon (Windows ICO)
├── sticky_notes_cute.png # High-resolution application branding icon
├── Enable-Auto-Start.bat # Convenience boot startup script
├── notes.example.json    # Starter template for fresh installations
└── .gitignore            # Git rules excluding personal notes and build artifacts
```

---

## 🤝 Contributing

Contributions, suggestions, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  Crafted with ❤️ for a clutter-free, beautiful desktop experience.
</p>
