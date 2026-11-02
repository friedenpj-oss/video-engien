export interface StylePreset {
  id: string;
  name: string;
  category: 'lyric_wondernitz' | 'lyric_spotlight' | 'lyric_3d' | 'short_reel' | 'cinematic' | 'music_video' | 'commercial' | 'cyberpunk' | 'vintage';
  description: string;
  badge: string;
  aspectRatioDefault: '16:9' | '9:16';
  
  // Lyric Engine Specific
  lyricLayoutMode?: 'wondernitz_block' | 'artist_spotlight' | 'perspective_3d' | 'neon_karaoke' | 'liquid_chrome' | 'spatial_parallax' | 'ransom_note' | 'elastic_bounce' | 'editorial_serif' | 'retro_crt' | 'indie_sketch' | 'minimalist';
  balloonFontEffect?: boolean;
  tornPaperEdges?: boolean;
  artistCutoutSlot?: boolean;
  showSongCredits?: boolean;
  proceduralTheme?: string;

  // Visual effects
  filmGrain: number; // 0.0 to 1.0
  letterbox: boolean;
  letterboxRatio?: number; // e.g. 2.39:1
  vignette: number; // 0.0 to 1.0
  lutFilter: 'none' | 'kodak_warm' | 'fuji_cool' | 'cyber_neon' | 'monochrome_noir' | 'vintage_sepia' | 'technicolor' | 'royal_blue';
  glowIntensity: number; // 0.0 to 1.0
  chromaticAberration: number; // 0.0 to 1.0
  // Motion physics
  springStiffness: number; // 80 to 300
  springDamping: number; // 10 to 40
  springMass: number; // 0.5 to 2.0
  cameraMotionBias: 'dynamic_zoom' | 'cinematic_drift' | 'rhythmic_pulse' | 'smooth_pan' | 'subtle_float';
  transitionCurve: 'spring' | 'easeInOut' | 'snap_cut' | 'strobe';
  // Typography Defaults
  fontFamily: string;
  captionStyle: 'tiktok_pop' | 'cinematic_sub' | 'bold_lower_third' | 'glitch_matrix' | 'minimalist' | 'wondernitz_stack';
}

export interface FontPreset {
  id: string;
  name: string;
  fontFamily: string;
  category: 'social_bold' | 'cinematic' | 'tech_cyber' | 'handwritten' | 'classic';
  googleFontUrl?: string;
  weights: number[];
  previewSample: string;
  defaultTracking: string; // letter-spacing
  defaultTransform: 'none' | 'uppercase' | 'capitalize';
}

export interface CaptionConfig {
  fontFamily: string;
  fontSize: number; // base px
  fontWeight: number;
  textColor: string;
  highlightColor: string; // for active word in kinetic text
  strokeWidth: number;
  strokeColor: string;
  dropShadowBlur: number;
  dropShadowColor: string;
  tracking: number; // px letter spacing
  textTransform: 'none' | 'uppercase' | 'capitalize';
  boxStyle: 'translucent_black' | 'solid_black' | 'neon_glow' | 'frosted_glass' | 'none';
  animationMode: 'word_kinetic' | 'karaoke_sweep' | 'spring_bounce' | 'fade_up' | 'typewriter' | 'static';
  positionY: number; // 0.0 (top) to 1.0 (bottom)
}
