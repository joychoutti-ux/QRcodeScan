export interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: number;
  color?: string; // Optional aesthetic color override
}

export interface UserProfile {
  username: string;
  hasJoined: boolean;
}

export enum AppMode {
  DISPLAY = 'DISPLAY',
  CLIENT = 'CLIENT',
}

export interface ModerationResult {
  isSafe: boolean;
  cleanedText: string;
  reason?: string;
}

export interface DanmakuItemProps extends Message {
  top: number; // Percentage from top
  duration: number; // Animation duration in seconds
  onComplete: (id: string) => void;
}
