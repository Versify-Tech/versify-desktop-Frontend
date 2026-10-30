import { useState, useRef, useCallback } from 'react';
import { aiService, PresentationAction } from '../services/aiService';

interface UseAudioRecorderOptions {
  intervalMs?: number; // Chunk duration in milliseconds
  onActionMatch?: (action: PresentationAction) => void;
  onError?: (error: any) => void;
}

export function useAudioRecorder({
  intervalMs = 4000,
  onActionMatch,
  onError,
}: UseAudioRecorderOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (event: BlobEvent) => {
        if (event.data.size > 0) {
          try {
            const result = await aiService.sendAudioChunk(event.data);
            if (result?.presentation_action && onActionMatch) {
              onActionMatch(result.presentation_action);
            }
          } catch (err) {
            if (onError) onError(err);
          }
        }
      };

      // Slice audio into intervals for real-time processing
      mediaRecorder.start(intervalMs);
      setIsListening(true);
    } catch (err) {
      console.error('Microphone access error:', err);
      if (onError) onError(err);
    }
  }, [intervalMs, onActionMatch, onError]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsListening(false);
  }, []);

  return { isListening, startListening, stopListening };
}