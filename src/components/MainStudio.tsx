import React, { useState } from "react";
import { UserSession, VerseData } from "../types";
import { parseBibleReference } from "../verseParser";

interface MainStudioProps {
  session: UserSession;
}

export const MainStudio: React.FC<MainStudioProps> = ({ session }) => {
  const [searchInput, setSearchInput] = useState("");
  const [previewVerse, setPreviewVerse] = useState<VerseData | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);

    const parsed = parseBibleReference(value);
    if (parsed) {
      setPreviewVerse({
        book: parsed.book,
        chapter: parsed.chapter,
        verse: parsed.verse,
        text: "Sample scripture text loaded from local SQLite engine."
      });
    } else {
      setPreviewVerse(null);
    }
  };

  return (
    <div className="studio-root">
      <header className="studio-header">
        <div className="brand">
          <span className="brand-name">VERSIFY</span>
          <span className={`badge ${session.licenseTier === "PRO" ? "pro" : "free"}`}>
            {session.licenseTier} TIER
          </span>
        </div>
        <div className="user-info">
          <span>{session.email}</span>
        </div>
      </header>

      <main className="studio-workspace">
        <div className="workspace-card">
          <h2>Verse Search & Projection Control</h2>
          <input
            type="text"
            className="search-input"
            value={searchInput}
            onChange={handleSearch}
            placeholder="Type 'Jn 3:16' or speak 'turn to first john chapter four verse eight'..."
          />

          {previewVerse && (
            <div className="preview-box">
              <h3>🎯 MATCH FOUND: [{previewVerse.book} {previewVerse.chapter}:{previewVerse.verse}]</h3>
              <p>"{previewVerse.text}"</p>
              <button className="btn-live">📺 Send to Display Screen (Monitor 2)</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};