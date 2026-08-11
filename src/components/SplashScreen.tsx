// src/components/SplashScreen.tsx
import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 200);
          return 100;
        }
        return prev + 10;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#09090b',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Centered Card Badge matching your video frame 00:02 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2.5rem 3.5rem',
        borderRadius: '16px',
        backgroundColor: '#09090b',
        border: '1px solid #1c1917',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', color: '#eab308' }}>⚡</div>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 800,
          letterSpacing: '2px',
          color: '#38bdf8',
          margin: 0,
          textTransform: 'uppercase'
        }}>
          VERSIFY STUDIO
        </h1>
        <p style={{
          color: '#0284c7',
          fontSize: '0.75rem',
          fontWeight: 600,
          marginTop: '0.5rem',
          letterSpacing: '1.5px',
          textTransform: 'uppercase'
        }}>
          NEXT-GEN CHURCH PRESENTATION ENGINE
        </p>

        {/* Progress Bar */}
        <div style={{
          width: '200px',
          height: '3px',
          backgroundColor: '#1c1917',
          borderRadius: '2px',
          marginTop: '2rem',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#0284c7',
            transition: 'width 0.05s ease-out'
          }} />
        </div>
      </div>
    </div>
  );
};