// Configurable base URL: Uses environment variable if available, otherwise defaults to local FastAPI server
const API_BASE_URL = (import.meta as any).env?.VITE_AI_API_URL || "http://127.0.0.1:8000/api/v1";

// --- Types & Interfaces ---

export type AIMode = "general" | "multi_faith" | "sermon_prep" | "church_media";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  mode?: AIMode;
  history?: ChatMessage[];
}

export interface ChatResponse {
  response: string;
  mode_used: AIMode;
}

export interface PresentationAction {
  matched_song: string;
  current_verse: string;
  confidence_score: number;
  raw_transcript: string;
}

export interface AudioResponse {
  status: string;
  transcription: string;
  presentation_action: PresentationAction;
}

export interface RAGMatch {
  content: string;
  metadata?: Record<string, any>;
  relevance_score: number;
}

export interface RAGQueryResponse {
  namespace: string;
  query: string;
  matches: RAGMatch[];
}

export interface RAGIngestRequest {
  namespace: string;
  texts: string[];
  metadatas?: Record<string, any>[];
}

export interface RAGIngestResponse {
  status: string;
  added_count: number;
  namespace: string;
}

// --- Service Implementation ---

export const aiService = {
  /**
   * 1. General, Multi-Faith, Sermon Prep, and Media Chat Completion
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: request.message,
          mode: request.mode || "general",
          history: request.history || [],
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error (${response.status}): ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to communicate with Versify-AI backend:", error);
      throw error;
    }
  },

  /**
   * 2. Live Worship Audio Transcription & Slide Auto-Switcher
   */
  async sendAudioChunk(audioBlob: Blob): Promise<AudioResponse> {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "worship_chunk.wav");

      const response = await fetch(`${API_BASE_URL}/audio/transcribe-worship`, {
        method: "POST",
        body: formData, // Fetch automatically manages headers for FormData
      });

      if (!response.ok) {
        throw new Error(`Audio processing error (${response.status}): ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Audio stream upload failed:", error);
      throw error;
    }
  },

  /**
   * 3. Query the Multi-Faith RAG Knowledge Base (Vector Search)
   */
  async queryKnowledgeBase(namespace: string, query: string, k: number = 3): Promise<RAGQueryResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/rag/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ namespace, query, k }),
      });

      if (!response.ok) {
        throw new Error(`RAG query error (${response.status}): ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("RAG search failed:", error);
      throw error;
    }
  },

  /**
   * 4. Ingest Documents into Vector Database (Scriptures, Hymns, Commentaries)
   */
  async ingestDocuments(request: RAGIngestRequest): Promise<RAGIngestResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/rag/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`RAG ingestion error (${response.status}): ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("RAG ingestion failed:", error);
      throw error;
    }
  },
};