export interface MemoryItem {
  id: string;
  imageUrl: string;
  videoUrl?: string;
  mediaType?: 'image' | 'video';
  caption: string;
  date: string;
  note: string;
}

export interface LoveLetterData {
  recipient: string;
  title: string;
  body: string;
  signature: string;
  date: string;
  footerPhotoUrl?: string;
  footerVideoUrl?: string;
}

export interface GiftConfig {
  id: string;
  particlePhrases: string[];
  floatingWishes: string[];
  memories: MemoryItem[];
  loveLetter: LoveLetterData;
  musicTrackIndex: number;
  customAudioDataUrl?: string;
  customAudioName?: string;
  updatedAt?: string;
}
