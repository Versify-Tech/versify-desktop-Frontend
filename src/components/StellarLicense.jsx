import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core'; // Use '@tauri-apps/api/tauri' if on Tauri v1

export function StellarLicense() {
  const [publicKey, setPublicKey] = useState('');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!publicKey.trim()) return;
    setLoading(true);
    try {
      // Calls the Rust command we compiled in src-tauri/src/main.rs
      const res = await invoke('verify_license', { stellarPublicKey: publicKey.trim() });
      setSession(res);
    } catch (err) {
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', borderRadius: '8px', background: '#1e293b', color: '#fff', maxWidth: '450px' }}>
      <h3 style={{ marginTop: 0 }}>🌟 Stellar Wave License Verification</h3>
      <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
        Enter your Stellar Public Key (`G...`) holding your Versify access token.
      </p>

      <input
        type="text"
        placeholder="G..."
        value={publicKey}
        onChange={(e) => setPublicKey(e.target.value)}
        style={{
          width: '100%',
          padding: '10px',
          borderRadius: '4px',
          border: '1px solid #334155',
          background: '#0f172a',
          color: '#fff',
          marginBottom: '10px',
          boxSizing: 'border-box'
        }}
      />

      <button
        onClick={handleVerify}
        disabled={loading}
        style={{
          width: '100%',
          padding: '10px',
          borderRadius: '4px',
          background: '#2563eb',
          color: '#fff',
          fontWeight: 'bold',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Verifying on Stellar Network...' : 'Verify License'}
      </button>

      {session && (
        <div style={{ marginTop: '15px', padding: '10px', borderRadius: '4px', background: '#0f172a', fontSize: '0.85rem' }}>
          <p><strong>Status:</strong> {session.is_active ? '✅ License Verified' : '❌ Inactive / Free Tier'}</p>
          <p><strong>Tier:</strong> {session.license_tier}</p>
          <p><strong>Network Message:</strong> {session.message}</p>
        </div>
      )}
    </div>
  );
}