# ⚡ Versify Desktop Frontend (`React + Vite + Tauri UI`)

[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Stellar](https://img.shields.io/badge/Stellar-Network-14B6EF.svg?style=flat-square&logo=stellar)](https://stellar.org/)
[![Drips Wave](https://img.shields.io/badge/Drips%20Wave-Eligible-00E599.svg?style=flat-square)](https://drips.network/wave/stellar)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

The React-based user interface for **Versify** — a modern, open-source church presentation platform built with React, Vite, and Tauri, featuring **Stellar Network Blockchain Software Licensing**.

---

## 📑 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [Frontend Architecture](#-frontend-architecture)
- [Stellar Wallet & Licensing Integration](#-stellar-wallet--licensing-integration)
- [Project Directory Structure](#-project-directory-structure)
- [Local Development Setup](#-local-development-setup)
- [Packaging & Production Releases](#-packaging--production-releases)
- [Stellar Wave Program (Drips)](#-stellar-wave-program-drips)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Overview

Versify replaces proprietary presentation software with an open-source solution. The React frontend provides a responsive interface for church media operators to control live projection, customize scripture displays, and verify license ownership using Stellar public keys (`G...`).

---

## ✨ Key Features

* **Stellar Public Key License Activation:** Integrated modal that sends user public keys to the Rust backend to verify active `VERSIFY` token balances on-chain.
* **Instant Scripture Projection:** Interactive Bible verse search interface with live screen previews.
* **Real-time Status Indicator:** Displays online/offline status, current user session details, and Stellar token balance.
* **Responsive Dark Mode UI:** Designed for dark sanctuary tech booths.

---

## 🏗️ Frontend Architecture

The frontend communicates with the Tauri Rust core over IPC using `@tauri-apps/api`.

┌────────────────────────────────────────────────────────────────────────┐
│                        React Application (src/)                        │
│                                                                        │
│  ┌─────────────────────┐    ┌─────────────────────┐    ┌────────────┐  │
│  │ StellarLicense.jsx  │    │ BiblePresenter.jsx  │    │ Navbar.jsx │  │
│  └──────────┬──────────┘    └──────────┬──────────┘    └─────┬──────┘  │
└─────────────┼──────────────────────────┼─────────────────────┼─────────┘
│                          │                     │
└──────────────────────────┼─────────────────────┘
|
v @tauri-apps/api/core
invoke('verify_license', { ... })
invoke('get_bible_verse', { ... })
|
v
Native Rust Backend Core (src-tauri)


---

## 🌌 Stellar Wallet & Licensing Integration

Users activate Versify Pro by submitting their Stellar Public Key (`G...`):

```jsx
import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

export function StellarLicense() {
  const [publicKey, setPublicKey] = useState('');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!publicKey.trim()) return;
    setLoading(true);
    try {
      const res = await invoke('verify_license', { stellarPublicKey: publicKey.trim() });
      setSession(res);
    } catch (err) {
      console.error('Failed to verify license:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 text-white rounded-lg shadow-xl max-w-md">
      <h2 className="text-xl font-bold mb-2">🌟 Stellar License Verification</h2>
      <input
        type="text"
        placeholder="Enter Stellar Key (G...)"
        value={publicKey}
        onChange={(e) => setPublicKey(e.target.value)}
        className="w-full p-2 mb-4 rounded bg-slate-800 border border-slate-700 text-white"
      />
      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-500 font-bold py-2 rounded transition"
      >
        {loading ? 'Querying Stellar Network...' : 'Verify License'}
      </button>

      {session && (
        <div className="mt-4 p-3 bg-slate-800 rounded border border-slate-700 text-sm">
          <p><strong>Status:</strong> {session.is_active ? 'Active ✅' : 'Inactive ❌'}</p>
          <p><strong>Tier:</strong> {session.license_tier}</p>
          <p><strong>Message:</strong> {session.message}</p>
        </div>
      )}
    </div>
  );
}
📁 Project Directory Structure
Plaintext
versify-desktop/
├── src/
│   ├── assets/             # Logos, icons, and static graphics
│   ├── components/         # Modular React UI components
│   │   ├── StellarLicense.jsx # Stellar Key Verification modal
│   │   ├── ProjectionView.jsx # Live presentation output
│   │   └── VerseSearch.jsx    # Scripture search bar & controller
│   ├── App.jsx             # Main application layout & routes
│   ├── main.jsx            # React root DOM renderer
│   └── index.css           # Global Tailwind CSS styles
├── public/                 # Favicons and web app manifest
├── index.html              # HTML entrypoint
├── package.json            # NPM dependencies and scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS theme configuration
└── README.md