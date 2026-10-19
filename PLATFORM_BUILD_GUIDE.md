# VYAPRIX Multi-Platform Production Build & Deployment Guide

This guide outlines the architecture and exact build procedures for:
1. **Web Application / PWA**
2. **Windows Desktop Installer (`VYAPRIX-Setup.exe`)**
3. **Android Application (APK for testing & AAB for Google Play Store)**

---

## Architecture Overview

VYAPRIX utilizes a single shared **React 19 + TypeScript + Vite** codebase that compiles seamlessly across all platforms:
- **Shared Business Logic**: Centralized GST arithmetic, line item calculations, round-offs, invoice verification, and stock deductions (`src/shared/businessLogic/`).
- **Offline-First Storage**:
  - **Windows Desktop**: Electron SQLite / persistent local database (`electron/main.cjs` & `electron/preload.cjs`).
  - **Web & Android**: Transactional IndexedDB (`src/services/offlineStorageAdapter.ts`) with zero external weight.
- **Durable Sync Queue**: All offline invoices and inventory adjustments receive unique operation IDs (`op_<timestamp>_<uuid>`) and are queued locally. Upon network reconnection or manual sync, operations are uploaded to Firebase Firestore with multi-tenant isolation (`/merchants/{businessId}/...`).
- **Firebase Backend**:
  - **Project ID**: `gen-lang-client-0633391196`
  - **Database ID**: `ai-studio-shopmatebusiness-65c13941-3e35-463d-a364-7b303ff0e73c`
  - **Security Rules**: Deployed in `firestore.rules` enforcing strict tenant partitioning.

---

## 1. Web Application Build (Website & PWA)

### Prerequisites:
- Node.js (v20+ recommended)
- npm (v10+)

### Commands:
```bash
# Install dependencies
npm install

# Run automated tests
npm run test

# Compile production web build
npm run build:web
```

### Outputs:
- **Output Directory**: `dist/`
- Contains optimized HTML, JS bundles, CSS, and static assets ready for deployment to any web host (Firebase Hosting, Vercel, Netlify, or Nginx).

---

## 2. Windows Desktop Installer (`VYAPRIX-Setup.exe`)

Windows desktop packaging includes a **real compiled NSIS setup wizard installer** (`public/VYAPRIX-Setup.exe`):

### What happens when you run `VYAPRIX-Setup.exe` on Windows:
1. **Professional Setup Wizard**: Launches the Nullsoft Install System (NSIS) wizard with installation folder selection (`%LocalAppData%\Programs\VYAPRIX` - requires no admin rights!).
2. **Native Win32 GUI Application (`vyaprix.exe`)**:
   - Launches an embedded local micro-server for instant offline operation.
   - Launches in native standalone Application Mode via Microsoft Edge or Chrome (`--app` borderless desktop window).
   - Works 100% offline with full LocalStorage, IndexedDB, and receipt printing.
   - Synchronizes automatically with Firebase Firestore when internet is available.
3. **Shortcuts & Uninstaller**:
   - Creates a Desktop shortcut: `VYAPRIX Billing & POS.lnk`
   - Creates a Start Menu folder: `Programs\VYAPRIX`
   - Adds full Windows Add/Remove Programs registry entry with uninstaller (`Uninstall.exe`).

### Building from Source:
```bash
# Compile web assets, native Windows executable, and NSIS installer
npm run build:installer
```

### Output:
- **File**: `public/VYAPRIX-Setup.exe` (~1.1 MB compressed self-extracting archive)
- Available for 1-click download directly from the website navbar next to FAQ!

## 3. Android Application (Testing APK & Play Store AAB)

Android packaging uses **Capacitor** configured in `capacitor.config.ts`.

### Prerequisites:
- **Android Studio** (Ladybug or newer)
- **Java JDK 17**
- Android SDK Build-Tools 34+

### Step-by-Step Android Build:

```bash
# 1. Add Android native project (first time only)
npx cap add android

# 2. Build web assets and sync to native Android container
npm run cap:android

# 3. Open in Android Studio
npx cap open android
```

### Generating Binaries in Android Studio or Command Line:

#### A. Testing APK (For sideloading on Android phones/tablets):
```bash
cd android
./gradlew assembleDebug
```
- **Output File**: `android/app/build/outputs/apk/debug/app-debug.apk`

#### B. Production AAB (For Google Play Store submission):
```bash
cd android
./gradlew bundleRelease
```
- **Output File**: `android/app/build/outputs/bundle/release/app-release.aab`
- Sign with your release keystore before submitting to Google Play Console.

---

## 4. Offline Billing & Cloud Sync Verification

- **Offline Mode**: If the internet disconnects, the top header badge updates to **Offline (X)**. Invoices can still be generated, printed, and saved atomically.
- **Syncing**: Once internet connectivity resumes or the user clicks the **Sync** button, pending invoices are idempotently pushed to Firebase Firestore.
- **Zero Secret Exposure**: Frontend code utilizes Firebase Client SDK tokens with `firestore.rules`. No Google Cloud service account keys or payment gateway secrets are embedded into the client code.
