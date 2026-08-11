# ⚡ Versify Desktop — Frontend UI & User Experience Engine

[![Drips Wave](https://img.shields.io/badge/Drips%20Wave-Support%20Frontend-6C5CE7?style=for-the-badge&logo=ripple&logoColor=white)](https://drips.network/app/projects/github/Versify-Tech/versify-desktop-Frontend)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)

Welcome to the **Versify Desktop Frontend** repository! This project powers the entire visual user experience, interface layout, and client-side logic for **Versify Studio**—a high-speed, modern desktop application crafted specifically for live church services, broadcast media teams, and scripture presentation environments.

The frontend is designed with speed, readability, and immediate accessibility in mind. During live worship services and sermons, media operators need high-speed execution without searching through cluttered menus. Versify addresses this by providing an intuitive Office-style ribbon layout, instant live previews, high-contrast confidence monitors, and intelligent speech recognition listeners.

---

## 🏛️ Comprehensive Architecture & Frontend Responsibilities

The frontend architecture operates as a fully decoupled single-page application (SPA) optimized for zero-latency interactions. It renders the primary presentation controller, live stage monitors, and projector output layers, communicating seamlessly with the native Rust backend over Tauri's asynchronous Inter-Process Communication (IPC) bridge.

### Key Architectural Layers:
1. **Ribbon Interface & Command Center:** 
   * Contextual ribbon navigation containing tabs for Home, Scripture Projection, Media Playback, Stage Outputs, and System Configuration.
   * Visual slide queue management allowing quick staging, live firing, and clearing of projection outputs.

2. **Real-time Speech-to-Text & Verse Parser (`verseParser.ts`):**
   * Client-side stream listener that parses live sermon audio transcriptions in real time.
   * Utilizes regex and contextual matching engines to recognize spoke scripture cues (e.g., *"Turn with me to John chapter 3 verse 16"*) and auto-stage matching scripture slides for the media team.

3. **Multi-Stage Display Layout Engine:**
   * Dynamic stage management handling layouts for the main auditorium screens, confidence monitors for stage speakers, and broadcast lower-thirds.
   * High-contrast design guidelines engineered specifically to prevent eye fatigue in low-light control booths.

4. **Authentication & Licensing Client (`SplashScreen.tsx` / `AuthCheck.tsx`):**
   * Secure user onboarding, startup splash routines, license validation state management, and account session persistence.

---

## 📊 Detailed Development Roadmap & Feature Matrix

### ✅ Completed & Fully Operational Features
* [x] **Modular Ribbon Navigation Bar:** Tabbed header interface with custom action buttons for seamless service control.
* [x] **Live Confidence Monitor System:** Dedicated stage monitor UI displaying active slides, current time, speaker timers, and upcoming scripture cues.
* [x] **Real-Time Scripture Parser Engine:** Instant speech pattern analysis converting live voice transcripts into clickable Bible passage cues.
* [x] **Dynamic Verse Quick-Search:** Sub-second client-side filtering for books, chapters, and verses across multiple translations.
* [x] **Authentication & Licensing Screens:** Visual onboarding flow, key verification handlers, and splash screen routines.

### 🚧 Currently In Development
* [ ] **Dynamic Visual Themes & High-Contrast Modes:** Full theme customization (Dark, Light, High-Contrast Control Booth Mode) tailored for auditorium lighting setups.
* [ ] **Lower-Third Broadcast Overlay Generator:** HTML5 Canvas / WebGL dynamic lower-third graphic engine with animated text transitions for broadcast software (OBS, vMix).
* [ ] **Custom Slide Layout Canvas:** Drag-and-drop slide designer allowing operators to position text, custom graphics, and lower-third backgrounds.

### 🚀 Long-Term Futuristic Roadmap
* [ ] **AI Sermon Outline Presenter:** Auto-generates structured bullet points and presentation slides in real time as the preacher speaks.
* [ ] **GPU-Accelerated Slide Transition Engine:** Custom CSS/WebGL shaders for smooth kinetic typography transitions, crossfades, and motion graphic backgrounds.
* [ ] **Mobile & Tablet Control Remote (PWA):** Progressive Web App wrapper enabling pastors and media directors to trigger slides remotely from an iPad, tablet, or smartphone.
* [ ] **Multi-Language UI Localization:** Full i18n support for global multi-lingual congregations and international ministry teams.

---

## 💧 Why Support the Frontend on Drips Wave?

Continuous presentation software shouldn't be sluggish, bloated, or overly expensive. By supporting `versify-desktop-Frontend` on **Drips Wave**, you are directly funding open-source UX development, accessible control panel design, and intelligent AI-driven worship presentation tools.

Your continuous micro-funding helps us dedicate developer hours to optimizing screen render performance, adding customizable lower-third themes, and expanding global language translations.

👉 **[Stream Support to `versify-desktop-Frontend` on Drips Wave](https://drips.network/app/projects/github/Versify-Tech/versify-desktop-Frontend)**

---

## 🛠️ Local Development & Setup Instructions

### Prerequisites
* **Node.js:** `v18.x` or higher
* **Package Manager:** `npm` or `pnpm`

### Installation Commands

```bash
# 1. Clone the frontend repository
git clone [https://github.com/Versify-Tech/versify-desktop-Frontend.git](https://github.com/Versify-Tech/versify-desktop-Frontend.git)
cd versify-desktop-Frontend

# 2. Install all UI dependencies
npm install

# 3. Launch the Vite local development server
npm run dev