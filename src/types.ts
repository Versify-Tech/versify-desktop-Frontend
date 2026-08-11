// src/types.ts

export type AppStage = 'SPLASH' | 'AUTH_CHECK' | 'AUTH_FAILED' | 'MAIN_STUDIO';

export interface UserSession {
  userId: string;
  licenseTier: string;
  isActive: boolean;
}

export type SlideType = 'VERSE' | 'MEDIA' | 'NOTES' | 'LOWER_THIRD';

export interface ActiveSlide {
  type: SlideType;
  // Verse properties
  reference?: string;
  text?: string;
  version?: string;
  // Media properties
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  mediaName?: string;
  // Sermon Notes & Lower Third properties
  title?: string;
  subtitle?: string;
  notePoints?: string[];
}