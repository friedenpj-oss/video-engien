export type AspectRatio = '16:9' | '9:16';

export type CameraMotion = 
  | 'zoom_in' 
  | 'zoom_out' 
  | 'pan_left' 
  | 'pan_right' 
  | 'tilt_up' 
  | 'cinematic_drift' 
  | 'orbit' 
  | 'static';

export type TransitionType = 
  | 'crossfade' 
  | 'dissolve_black' 
  | 'wipe_right' 
  | 'zoom_in' 
  | 'cut';

export interface VisualAsset {
  id: string;
  name: string;
  path?: string;
  fileType: string;
  url: string;
  aspectRatio: 'landscape' | 'portrait' | 'square';
  width?: number;
  height?: number;
  tags: string[];
  thumbnail?: string;
}

export interface ScriptDocument {
  id: string;
  name: string;
  content: string;
  format: 'markdown' | 'pdf' | 'docx' | 'txt' | 'other';
  extractedScenesCount?: number;
}

export interface VideoScene {
  id: string;
  sceneNumber: number;
  title: string;
  duration: number; // in seconds, e.g. 5.5
  startTime: number; // in seconds
  assignedAssetId?: string;
  scriptBeat: string;
  visualPrompt: string;
  cameraMotion: CameraMotion;
  transition: TransitionType;
  transitionDuration: number; // in seconds, e.g. 0.8
  subtitle: string;
  lowerThird?: {
    title: string;
    subtitle: string;
  };
}

export interface SongMetadata {
  trackTitle: string;
  artistName: string;
  featuredArtists?: string;
  songwriters?: string;
  producers?: string;
  releaseDate?: string;
  albumTitle?: string;
  label?: string;
  tagline?: string;
  trackNumber?: string;
  artworkUrl?: string;
  artistPhotoUrl?: string;
  previewAudioUrl?: string;
}

export interface ProjectConfig {
  title: string;
  targetDuration: number; // 30, 60, 90, 120, etc.
  aspectRatio: AspectRatio;
  directorInstructions: string;
  style: 'cinematic' | 'social_reel' | 'documentary' | 'commercial' | 'cyberpunk';
  subtitlesEnabled: boolean;
  audioNarrationEnabled: boolean;
  bgMusicEnabled: boolean;
  musicMood: 'ambient_epic' | 'electronic_pulse' | 'acoustic_warm' | 'minimalist_piano';
  
  // Lyric Video Specific Properties
  projectMode?: 'storyboard' | 'lyric_video';
  backgroundType?: 'picture' | 'video' | 'procedural';
  proceduralBgStyle?: 'royal_blue_torn_paper' | 'studio_mixer_sketch' | 'night_highway' | 'cosmic_nebula' | 'neon_mesh' | 'sunset_fog' | 'crt_vhs';
  bgVideoUrl?: string;
  songMetadata?: SongMetadata;
}

export interface SequencingResponse {
  scenes: VideoScene[];
  scriptSummary: string;
  analysisNotes: string[];
  targetDuration: number;
  totalDuration: number;
}
