import { FontPreset, CaptionConfig } from '../types/styles';

export const FONT_PRESETS: FontPreset[] = [
  // Social & Bold
  {
    id: 'font-montserrat',
    name: 'Montserrat (Ultra Bold)',
    fontFamily: 'Montserrat',
    category: 'social_bold',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap',
    weights: [400, 700, 900],
    previewSample: 'THE ULTIMATE DROP',
    defaultTracking: '1px',
    defaultTransform: 'uppercase',
  },
  {
    id: 'font-inter',
    name: 'Inter (Modern Grotesk)',
    fontFamily: 'Inter',
    category: 'social_bold',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap',
    weights: [400, 600, 800, 900],
    previewSample: 'Next Generation Architecture',
    defaultTracking: '-0.5px',
    defaultTransform: 'none',
  },
  {
    id: 'font-bebas',
    name: 'Bebas Neue (Heavy Headline)',
    fontFamily: 'Bebas Neue',
    category: 'social_bold',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
    weights: [400],
    previewSample: 'UNLEASH THE FUTURE',
    defaultTracking: '2px',
    defaultTransform: 'uppercase',
  },
  {
    id: 'font-syne',
    name: 'Syne (Avant-Garde Display)',
    fontFamily: 'Syne',
    category: 'social_bold',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap',
    weights: [700, 800],
    previewSample: 'REVOLUTION IN SOUND',
    defaultTracking: '1px',
    defaultTransform: 'uppercase',
  },
  {
    id: 'font-space-grotesk',
    name: 'Space Grotesk (Neo-Brutalist)',
    fontFamily: 'Space Grotesk',
    category: 'social_bold',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&display=swap',
    weights: [600, 700],
    previewSample: 'AUTONOMOUS REACTION',
    defaultTracking: '0px',
    defaultTransform: 'none',
  },

  // Cinematic & Editorial
  {
    id: 'font-cinzel',
    name: 'Cinzel (Roman Epic Serif)',
    fontFamily: 'Cinzel',
    category: 'cinematic',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&display=swap',
    weights: [600, 700, 900],
    previewSample: 'CHRONICLES OF DESTINY',
    defaultTracking: '3px',
    defaultTransform: 'uppercase',
  },
  {
    id: 'font-playfair',
    name: 'Playfair Display (Dramatic Editorial)',
    fontFamily: 'Playfair Display',
    category: 'cinematic',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,800;1,600&display=swap',
    weights: [600, 800],
    previewSample: 'The Quiet Epilogue',
    defaultTracking: '1px',
    defaultTransform: 'capitalize',
  },
  {
    id: 'font-cormorant',
    name: 'Cormorant Garamond (Grace & Poise)',
    fontFamily: 'Cormorant Garamond',
    category: 'cinematic',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&display=swap',
    weights: [600, 700],
    previewSample: 'Echoes in the Marianas',
    defaultTracking: '2px',
    defaultTransform: 'uppercase',
  },

  // Futuristic & Tech
  {
    id: 'font-orbitron',
    name: 'Orbitron (Cyber Telemetry)',
    fontFamily: 'Orbitron',
    category: 'tech_cyber',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800;900&display=swap',
    weights: [600, 800, 900],
    previewSample: 'SYSTEM OVERRIDE // 2049',
    defaultTracking: '2.5px',
    defaultTransform: 'uppercase',
  },
  {
    id: 'font-rajdhani',
    name: 'Rajdhani (Mecha Velocity)',
    fontFamily: 'Rajdhani',
    category: 'tech_cyber',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&display=swap',
    weights: [600, 700],
    previewSample: 'SECTOR-04 DEPLOYMENT',
    defaultTracking: '1.5px',
    defaultTransform: 'uppercase',
  },
  {
    id: 'font-space-mono',
    name: 'Space Mono (Command Terminal)',
    fontFamily: 'Space Mono',
    category: 'tech_cyber',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap',
    weights: [400, 700],
    previewSample: 'INIT_SEQUENCE_01.SH',
    defaultTracking: '0px',
    defaultTransform: 'none',
  },

  // Handwritten & Music
  {
    id: 'font-permanent-marker',
    name: 'Permanent Marker (Graffiti / Indie)',
    fontFamily: 'Permanent Marker',
    category: 'handwritten',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap',
    weights: [400],
    previewSample: 'LOUD & UNFILTERED',
    defaultTracking: '1px',
    defaultTransform: 'uppercase',
  },
  {
    id: 'font-caveat',
    name: 'Caveat (Casual Sketch)',
    fontFamily: 'Caveat',
    category: 'handwritten',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&display=swap',
    weights: [600, 700],
    previewSample: 'written in real time...',
    defaultTracking: '0px',
    defaultTransform: 'none',
  },
];

export const DEFAULT_CAPTION_CONFIG: CaptionConfig = {
  fontFamily: 'Montserrat',
  fontSize: 28,
  fontWeight: 800,
  textColor: '#ffffff',
  highlightColor: '#fbbf24', // amber active word
  strokeWidth: 2,
  strokeColor: '#000000',
  dropShadowBlur: 8,
  dropShadowColor: 'rgba(0,0,0,0.9)',
  tracking: 1,
  textTransform: 'uppercase',
  boxStyle: 'translucent_black',
  animationMode: 'word_kinetic',
  positionY: 0.82,
};

const loadedFonts = new Set<string>();

/**
 * Loads Google Font dynamically into DOM and document.fonts.
 */
export function loadGoogleFont(fontName: string): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve();
  if (loadedFonts.has(fontName)) return Promise.resolve();

  const preset = FONT_PRESETS.find(f => f.fontFamily.toLowerCase() === fontName.toLowerCase());
  if (!preset || !preset.googleFontUrl) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = preset.googleFontUrl!;
    link.onload = () => {
      loadedFonts.add(fontName);
      if (document.fonts) {
        document.fonts.load(`16px "${fontName}"`).then(() => resolve()).catch(() => resolve());
      } else {
        resolve();
      }
    };
    link.onerror = () => resolve();
    document.head.appendChild(link);
  });
}
