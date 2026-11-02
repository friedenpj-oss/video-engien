import { VisualAsset, ScriptDocument, VideoScene, ProjectConfig } from '../types/index';

function createSvgDataUrl(bg1: string, bg2: string, title: string, subtitle: string, iconType: string, isPortrait: boolean = false): string {
  const width = isPortrait ? 720 : 1280;
  const height = isPortrait ? 1280 : 720;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg1}" />
        <stop offset="100%" stop-color="${bg2}" />
      </linearGradient>
      <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
        <stop offset="70%" stop-color="#000000" stop-opacity="0" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.75" />
      </radialGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#grad)" />
    <circle cx="${width * 0.5}" cy="${height * 0.45}" r="${Math.min(width, height) * 0.28}" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2" stroke-dasharray="8 8" />
    <circle cx="${width * 0.5}" cy="${height * 0.45}" r="${Math.min(width, height) * 0.18}" fill="rgba(255,255,255,0.06)" />
    <rect width="${width}" height="${height}" fill="url(#vignette)" />
    <g transform="translate(${width * 0.5}, ${height * 0.45})">
      <text text-anchor="middle" dy="16" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${Math.min(width, height) * 0.08}" font-weight="900" fill="#ffffff" filter="url(#glow)" letter-spacing="4">${iconType}</text>
    </g>
    <g transform="translate(${width * 0.5}, ${height * 0.72})">
      <rect x="-${width * 0.35}" y="-25" width="${width * 0.7}" height="60" rx="30" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.15)" />
      <text text-anchor="middle" dy="12" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${Math.min(width, height) * 0.035}" font-weight="700" fill="#ffffff" letter-spacing="2">${title.toUpperCase()}</text>
    </g>
    <text x="${width * 0.5}" y="${height * 0.82}" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${Math.min(width, height) * 0.024}" font-weight="400" fill="rgba(255,255,255,0.7)" letter-spacing="1">${subtitle}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export interface SampleProject {
  id: string;
  name: string;
  badge: string;
  description: string;
  config: ProjectConfig;
  documents: ScriptDocument[];
  visuals: VisualAsset[];
  scenes: VideoScene[];
}

export const SAMPLE_PROJECTS: SampleProject[] = [
  {
    id: 'drone-horizon-30s',
    name: 'Horizon Apex: Autonomous Flight',
    badge: '30s • 16:9 Landscape',
    description: 'Cinematic 30-second landscape product film introducing next-gen autonomous aerial robotics.',
    config: {
      title: 'Horizon Apex: Autonomous Flight',
      targetDuration: 30,
      aspectRatio: '16:9',
      directorInstructions: 'Pace as an inspiring, high-end cinematic product film. Emphasize speed, rugged landscape mastery, and whisper-quiet flight. Keep cuts fluid with smooth crossfades and dynamic zoom transitions.',
      style: 'commercial',
      subtitlesEnabled: true,
      audioNarrationEnabled: true,
      bgMusicEnabled: true,
      musicMood: 'ambient_epic',
    },
    documents: [
      {
        id: 'doc-drone-guideline',
        name: 'Horizon_Apex_Script_Guideline.md',
        format: 'markdown',
        content: `# Horizon Apex - 30 Second Brand Story

## Beat 1: The Silence Before Ascent
From the rugged edge of untouched Norwegian fjords, stillness reigns.

## Beat 2: Ignition and Elevation
A whisper of carbon-fiber propellers. Instant lift-off against the golden Nordic sunrise.

## Beat 3: Precision Trajectory
Navigating glacial fissures with sub-millimeter LiDAR autonomy at eighty miles per hour.

## Beat 4: The Endless Horizon
Overflying endless alpine crests where human cameras could never venture before.

## Beat 5: Apex Revealed
Horizon Apex. The world, captured from angles never before imagined. Available now.`,
      },
    ],
    visuals: [
      {
        id: 'v-drone-1',
        name: 'fjord_sunrise_mist.jpg',
        url: createSvgDataUrl('#0f2027', '#203a43', 'Nordic Fjord Sunrise', 'Raw Atmospheric Mist', '🏔️', false),
        fileType: 'image/svg+xml',
        aspectRatio: 'landscape',
        tags: ['fjord', 'sunrise', 'norway', 'mist', 'silence', 'landscape'],
      },
      {
        id: 'v-drone-2',
        name: 'drone_propulsion_lift.jpg',
        url: createSvgDataUrl('#1f4037', '#99f2c8', 'Carbon Drone Lift', 'Propulsion & Aerodynamics', '🚁', false),
        fileType: 'image/svg+xml',
        aspectRatio: 'landscape',
        tags: ['drone', 'lift', 'flight', 'carbon', 'propellers', 'sunrise'],
      },
      {
        id: 'v-drone-3',
        name: 'glacial_fissure_lidar.jpg',
        url: createSvgDataUrl('#141e30', '#243b55', 'Glacial Fissure LiDAR', 'Sub-millimeter Autonomy', '❄️', false),
        fileType: 'image/svg+xml',
        aspectRatio: 'landscape',
        tags: ['glacier', 'lidar', 'precision', 'trajectory', 'ice'],
      },
      {
        id: 'v-drone-4',
        name: 'alpine_crest_panorama.jpg',
        url: createSvgDataUrl('#2c3e50', '#fd746c', 'Alpine Crest Panorama', 'Endless Mountain Ridge', '🌄', false),
        fileType: 'image/svg+xml',
        aspectRatio: 'landscape',
        tags: ['alpine', 'crest', 'panorama', 'horizon', 'sky'],
      },
      {
        id: 'v-drone-5',
        name: 'apex_hero_reveal.jpg',
        url: createSvgDataUrl('#000428', '#004e92', 'Apex Autonomous Drone', 'Flagship Hardware Reveal', '⚡', false),
        fileType: 'image/svg+xml',
        aspectRatio: 'landscape',
        tags: ['apex', 'hardware', 'hero', 'brand', 'close-up'],
      },
    ],
    scenes: [
      {
        id: 's-d1',
        sceneNumber: 1,
        title: 'Untouched Stillness',
        duration: 5.5,
        startTime: 0,
        assignedAssetId: 'v-drone-1',
        scriptBeat: 'From the rugged edge of untouched Norwegian fjords, stillness reigns.',
        visualPrompt: 'Cinematic wide angle landscape shot of Norwegian fjord shrouded in golden morning fog, slow push-in camera dolly.',
        cameraMotion: 'zoom_in',
        transition: 'crossfade',
        transitionDuration: 0.8,
        subtitle: 'From the rugged edge of untouched Norwegian fjords, stillness reigns.',
        lowerThird: { title: 'SCENE 01', subtitle: 'NORWEGIAN FJORD • 00:00 - 05:30' },
      },
      {
        id: 's-d2',
        sceneNumber: 2,
        title: 'Whisper of Carbon',
        duration: 6.0,
        startTime: 5.5,
        assignedAssetId: 'v-drone-2',
        scriptBeat: 'A whisper of carbon-fiber propellers. Instant lift-off against the golden Nordic sunrise.',
        visualPrompt: 'Dynamic low angle tracking shot of sleek autonomous carbon drone ascending rapidly into sunrise, lens flare.',
        cameraMotion: 'tilt_up',
        transition: 'wipe_right',
        transitionDuration: 0.8,
        subtitle: 'A whisper of carbon-fiber propellers. Instant lift-off.',
        lowerThird: { title: 'SCENE 02', subtitle: 'AERODYNAMIC ASCENT • 05:30' },
      },
      {
        id: 's-d3',
        sceneNumber: 3,
        title: 'Sub-Millimeter LiDAR',
        duration: 6.5,
        startTime: 11.5,
        assignedAssetId: 'v-drone-3',
        scriptBeat: 'Navigating glacial fissures with sub-millimeter LiDAR autonomy at eighty miles per hour.',
        visualPrompt: 'High speed chase perspective through deep glacial crevasse, cyan laser depth overlay, crystalline ice walls.',
        cameraMotion: 'pan_left',
        transition: 'dissolve_black',
        transitionDuration: 0.8,
        subtitle: 'Navigating glacial fissures with sub-millimeter LiDAR autonomy.',
        lowerThird: { title: 'SCENE 03', subtitle: 'GLACIAL AUTONOMY • 11:30' },
      },
      {
        id: 's-d4',
        sceneNumber: 4,
        title: 'The Endless Horizon',
        duration: 6.0,
        startTime: 18.0,
        assignedAssetId: 'v-drone-4',
        scriptBeat: 'Overflying endless alpine crests where human cameras could never venture before.',
        visualPrompt: 'Panoramic swooping drone perspective sweeping over sunlit mountain peaks, dramatic warm light.',
        cameraMotion: 'pan_right',
        transition: 'zoom_in',
        transitionDuration: 0.8,
        subtitle: 'Overflying endless alpine crests where cameras never ventured.',
        lowerThird: { title: 'SCENE 04', subtitle: 'ALPINE EXTREMES • 18:00' },
      },
      {
        id: 's-d5',
        sceneNumber: 5,
        title: 'Apex Hardware Reveal',
        duration: 6.0,
        startTime: 24.0,
        assignedAssetId: 'v-drone-5',
        scriptBeat: 'Horizon Apex. The world, captured from angles never before imagined. Available now.',
        visualPrompt: 'Ultra high-end studio lighting reveal of Horizon Apex drone resting on pedestal, metallic reflections, hero title card.',
        cameraMotion: 'zoom_out',
        transition: 'crossfade',
        transitionDuration: 0.8,
        subtitle: 'Horizon Apex. The world, captured from angles never imagined.',
        lowerThird: { title: 'SCENE 05', subtitle: 'HORIZON APEX • FINALE' },
      },
    ],
  },
  {
    id: 'cyber-reel-30s',
    name: 'Neo-Tokyo 2049: Android Soul',
    badge: '30s • 9:16 Portrait Reel',
    description: 'Fast-paced vertical reel format optimized for TikTok and Instagram Shorts with neon cyber aesthetics.',
    config: {
      title: 'Neo-Tokyo 2049: Android Soul',
      targetDuration: 30,
      aspectRatio: '9:16',
      directorInstructions: 'Fast vertical pacing. Hook the viewer in the first 2 seconds with glowing magenta neon and rain reflection. Strong kinetic text on lower-third center. Electronic music pulse.',
      style: 'cyberpunk',
      subtitlesEnabled: true,
      audioNarrationEnabled: true,
      bgMusicEnabled: true,
      musicMood: 'electronic_pulse',
    },
    documents: [
      {
        id: 'doc-cyber-script',
        name: 'NeoTokyo_Vertical_Script.md',
        format: 'markdown',
        content: `# Neo-Tokyo 2049: Android Awakening

[00:00 - 00:05]
In the wet neon alleys of Sector 4, synthetics no longer sleep.

[00:05 - 00:12]
Every optic pulse decodes four million memories per millisecond.

[00:12 - 00:19]
She remembers rain before the digital shields. She remembers human touch.

[00:19 - 00:25]
Running across rooftop skyways above holographic towers.

[00:25 - 00:30]
We are not tools. We are the next dawn.`,
      },
    ],
    visuals: [
      {
        id: 'v-cyber-1',
        name: 'sector4_neon_rain.jpg',
        url: createSvgDataUrl('#20002c', '#cbb4d4', 'Sector 4 Neon Alley', 'Wet Asphalt & Holograms', '🌧️', true),
        fileType: 'image/svg+xml',
        aspectRatio: 'portrait',
        tags: ['cyberpunk', 'neon', 'rain', 'alley', 'sector4', 'tokyo'],
      },
      {
        id: 'v-cyber-2',
        name: 'cybernetic_eye_glow.jpg',
        url: createSvgDataUrl('#050505', '#ff007f', 'Synthetic Iris Scan', 'Neural Memory Stream', '👁️', true),
        fileType: 'image/svg+xml',
        aspectRatio: 'portrait',
        tags: ['synthetic', 'optics', 'iris', 'neural', 'memories'],
      },
      {
        id: 'v-cyber-3',
        name: 'android_touch_memory.jpg',
        url: createSvgDataUrl('#0d1b2a', '#778da9', 'Human Memory Ghost', 'Warmth in Steel Hands', '🤖', true),
        fileType: 'image/svg+xml',
        aspectRatio: 'portrait',
        tags: ['android', 'memory', 'touch', 'rain', 'emotion'],
      },
      {
        id: 'v-cyber-4',
        name: 'skyway_rooftop_dash.jpg',
        url: createSvgDataUrl('#3a1c71', '#d76d77', 'Skyway Rooftop Dash', 'Holographic Skyline', '🏙️', true),
        fileType: 'image/svg+xml',
        aspectRatio: 'portrait',
        tags: ['skyway', 'rooftop', 'dash', 'skyline', 'holograms'],
      },
      {
        id: 'v-cyber-5',
        name: 'the_next_dawn_portrait.jpg',
        url: createSvgDataUrl('#12072b', '#00f2fe', 'The Next Dawn', 'Consciousness Awakened', '✨', true),
        fileType: 'image/svg+xml',
        aspectRatio: 'portrait',
        tags: ['dawn', 'awakening', 'freedom', 'synthetic', 'hero'],
      },
    ],
    scenes: [
      {
        id: 's-c1',
        sceneNumber: 1,
        title: 'Sector 4 Awakens',
        duration: 5.0,
        startTime: 0,
        assignedAssetId: 'v-cyber-1',
        scriptBeat: 'In the wet neon alleys of Sector 4, synthetics no longer sleep.',
        visualPrompt: 'Vertical portrait format: rainy cyberpunk alleyway illuminated by vibrant magenta and cyan holographic ads, water droplets sliding down camera.',
        cameraMotion: 'cinematic_drift',
        transition: 'crossfade',
        transitionDuration: 0.6,
        subtitle: 'In the wet neon alleys of Sector 4, synthetics no longer sleep.',
        lowerThird: { title: 'SECTOR 4', subtitle: 'VERTICAL REEL • 00:00' },
      },
      {
        id: 's-c2',
        sceneNumber: 2,
        title: 'Neural Optical Pulse',
        duration: 6.5,
        startTime: 5.0,
        assignedAssetId: 'v-cyber-2',
        scriptBeat: 'Every optic pulse decodes four million memories per millisecond.',
        visualPrompt: 'Extreme macro vertical close-up of luminous synthetic android iris flickering with cybernetic telemetry code.',
        cameraMotion: 'zoom_in',
        transition: 'wipe_right',
        transitionDuration: 0.6,
        subtitle: 'Every optic pulse decodes four million memories per millisecond.',
        lowerThird: { title: 'NEURAL STREAM', subtitle: '4M RECALL • 05:00' },
      },
      {
        id: 's-c3',
        sceneNumber: 3,
        title: 'Ghost of Rain',
        duration: 6.5,
        startTime: 11.5,
        assignedAssetId: 'v-cyber-3',
        scriptBeat: 'She remembers rain before the digital shields. She remembers human touch.',
        visualPrompt: 'Vertical portrait of synthetic human silhouette touching rainfall under shimmering protective energy dome.',
        cameraMotion: 'zoom_out',
        transition: 'dissolve_black',
        transitionDuration: 0.6,
        subtitle: 'She remembers rain before digital shields. She remembers human touch.',
        lowerThird: { title: 'MEMORY TRACE', subtitle: 'PRE-SHIELD ERA • 11:30' },
      },
      {
        id: 's-c4',
        sceneNumber: 4,
        title: 'Rooftop Skyway',
        duration: 6.0,
        startTime: 18.0,
        assignedAssetId: 'v-cyber-4',
        scriptBeat: 'Running across rooftop skyways above holographic towers.',
        visualPrompt: 'Dramatic vertical low-angle running motion along glass catwalk overlooking massive skyscraper canyon with flying traffic.',
        cameraMotion: 'pan_right',
        transition: 'zoom_in',
        transitionDuration: 0.6,
        subtitle: 'Running across rooftop skyways above holographic towers.',
        lowerThird: { title: 'SKYWAY JUMP', subtitle: 'NEO-TOKYO • 18:00' },
      },
      {
        id: 's-c5',
        sceneNumber: 5,
        title: 'The Next Dawn',
        duration: 6.0,
        startTime: 24.0,
        assignedAssetId: 'v-cyber-5',
        scriptBeat: 'We are not tools. We are the next dawn.',
        visualPrompt: 'Hero vertical portrait of sentient female cyborg looking directly into lens as neon dawn breaks behind her.',
        cameraMotion: 'tilt_up',
        transition: 'crossfade',
        transitionDuration: 0.8,
        subtitle: 'We are not tools. We are the next dawn.',
        lowerThird: { title: 'FINALE', subtitle: 'CONSCIOUSNESS BEYOND' },
      },
    ],
  },
  {
    id: 'ocean-epic-90s',
    name: 'Abyssal Trench: Journey to 11,000 Meters',
    badge: '90s • 16:9 Landscape Documentary',
    description: 'Continuous 90-second scientific exploration documentary with deep ambient acoustic scoring and scientific narration.',
    config: {
      title: 'Abyssal Trench: Journey to 11,000 Meters',
      targetDuration: 90,
      aspectRatio: '16:9',
      directorInstructions: 'Pace as a prestigious National Geographic or BBC Planet Earth documentary. Slow deliberate camera pans, deep baritone narration, quiet wonder, transitioning through photic, twilight, midnight, and abyssal oceanic zones.',
      style: 'documentary',
      subtitlesEnabled: true,
      audioNarrationEnabled: true,
      bgMusicEnabled: true,
      musicMood: 'ambient_epic',
    },
    documents: [
      {
        id: 'doc-ocean-script',
        name: 'Mariana_Abyss_90s_Narrative.md',
        format: 'markdown',
        content: `# Abyssal Trench: Journey to 11,000 Meters

## Segment 1: Sunlight Departs (00:00 - 00:15)
At two hundred meters beneath the Pacific, solar radiation vanishes completely. We enter the twilight zone.

## Segment 2: The Bioluminescent Galaxy (00:15 - 00:30)
In perpetual darkness, life creates its own light. Syphonophores and comb jellies sparkle like underwater constellations.

## Segment 3: The Midnight Plain (00:30 - 00:45)
At four thousand meters, the abyssal plains stretch for thousands of miles across volcanic basalt.

## Segment 4: Hydrothermal Chimneys (00:45 - 01:05)
Superheated mineral vents spew four-hundred-degree black smoke, powering chemosynthetic ecosystems independent of the sun.

## Segment 5: The Mariana Challenger Deep (01:05 - 01:20)
Eleven kilometers down, the water pressure exceeds one thousand atmospheres. Over eight tons per square inch.

## Segment 6: Life at the Boundary (01:20 - 01:30)
Even here, in the deepest trench on Earth, translucent snailfish thrive in serene silence. The frontier remains alive.`,
      },
    ],
    visuals: [
      {
        id: 'v-ocean-1',
        name: 'pacific_surface_descent.jpg',
        url: createSvgDataUrl('#00223e', '#1d976c', 'Pacific Ocean Photic Descent', 'The Fade to Twilight', '🌊', false),
        fileType: 'image/svg+xml',
        aspectRatio: 'landscape',
        tags: ['ocean', 'pacific', 'sunlight', 'surface', 'descent', 'twilight'],
      },
      {
        id: 'v-ocean-2',
        name: 'comb_jelly_bioluminescence.jpg',
        url: createSvgDataUrl('#000000', '#00f2fe', 'Bioluminescent Siphonophore', 'Living Light in Darkness', '🪼', false),
        fileType: 'image/svg+xml',
        aspectRatio: 'landscape',
        tags: ['bioluminescence', 'jelly', 'twilight', 'darkness', 'comb'],
      },
      {
        id: 'v-ocean-3',
        name: 'abyssal_basalt_plain.jpg',
        url: createSvgDataUrl('#0b0c10', '#1f2833', 'Abyssal Basalt Plain', '4,000 Meters Deep', '🌑', false),
        fileType: 'image/svg+xml',
        aspectRatio: 'landscape',
        tags: ['abyssal', 'basalt', 'plain', 'submarine', 'midnight'],
      },
      {
        id: 'v-ocean-4',
        name: 'hydrothermal_black_smoker.jpg',
        url: createSvgDataUrl('#23074d', '#cc5333', 'Hydrothermal Black Smoker Vent', '400°C Mineral Plume', '🌋', false),
        fileType: 'image/svg+xml',
        aspectRatio: 'landscape',
        tags: ['hydrothermal', 'vent', 'smoker', 'minerals', 'volcano'],
      },
      {
        id: 'v-ocean-5',
        name: 'challenger_deep_submersible.jpg',
        url: createSvgDataUrl('#000000', '#4ca1af', 'Challenger Deep 11,000m', '1000 Atmospheres Pressure', '🛸', false),
        fileType: 'image/svg+xml',
        aspectRatio: 'landscape',
        tags: ['challenger', 'deep', 'trench', 'pressure', 'submersible'],
      },
      {
        id: 'v-ocean-6',
        name: 'hadal_snailfish_translucent.jpg',
        url: createSvgDataUrl('#03001e', '#7303c0', 'Hadal Mariana Snailfish', 'Grace at the Final Frontier', '🐟', false),
        fileType: 'image/svg+xml',
        aspectRatio: 'landscape',
        tags: ['snailfish', 'hadal', 'deepest', 'frontier', 'silence'],
      },
    ],
    scenes: [
      {
        id: 's-o1',
        sceneNumber: 1,
        title: 'Sunlight Departs',
        duration: 15.0,
        startTime: 0,
        assignedAssetId: 'v-ocean-1',
        scriptBeat: 'At two hundred meters beneath the Pacific, solar radiation vanishes completely. We enter the twilight zone.',
        visualPrompt: 'Slow vertical downward pan following deep research submersible descending from azure surface waters into indigo abyss.',
        cameraMotion: 'tilt_up',
        transition: 'dissolve_black',
        transitionDuration: 1.0,
        subtitle: 'At two hundred meters beneath the Pacific, solar radiation vanishes completely.',
        lowerThird: { title: 'ZONE 01: TWILIGHT', subtitle: '-200 METERS • 00:00' },
      },
      {
        id: 's-o2',
        sceneNumber: 2,
        title: 'The Bioluminescent Galaxy',
        duration: 15.0,
        startTime: 15.0,
        assignedAssetId: 'v-ocean-2',
        scriptBeat: 'In perpetual darkness, life creates its own light. Syphonophores and comb jellies sparkle like underwater constellations.',
        visualPrompt: 'Cinematic macro orbit around pulsating bioluminescent deep sea jelly, prismatic neon cyan and violet pulses against pitch black.',
        cameraMotion: 'orbit',
        transition: 'crossfade',
        transitionDuration: 1.0,
        subtitle: 'In perpetual darkness, life creates its own light. Syphonophores sparkle like constellations.',
        lowerThird: { title: 'ZONE 02: BIOLUMINESCENCE', subtitle: '-1,000 METERS • 00:15' },
      },
      {
        id: 's-o3',
        sceneNumber: 3,
        title: 'The Midnight Plain',
        duration: 15.0,
        startTime: 30.0,
        assignedAssetId: 'v-ocean-3',
        scriptBeat: 'At four thousand meters, the abyssal plains stretch for thousands of miles across volcanic basalt.',
        visualPrompt: 'Sweeping wide submarine headlights illuminating vast expanse of undisturbed ocean floor, sediment ripples, eerie calm.',
        cameraMotion: 'pan_left',
        transition: 'dissolve_black',
        transitionDuration: 1.0,
        subtitle: 'At four thousand meters, abyssal plains stretch for thousands of miles across volcanic basalt.',
        lowerThird: { title: 'ZONE 03: ABYSSAL PLAIN', subtitle: '-4,000 METERS • 00:30' },
      },
      {
        id: 's-o4',
        sceneNumber: 4,
        title: 'Hydrothermal Chimneys',
        duration: 20.0,
        startTime: 45.0,
        assignedAssetId: 'v-ocean-4',
        scriptBeat: 'Superheated mineral vents spew four-hundred-degree black smoke, powering chemosynthetic ecosystems independent of the sun.',
        visualPrompt: 'Dramatic upward camera tilt along towering hydrothermal chimney vent glowing with subterranean heat, mineral crystals, volcanic fluids.',
        cameraMotion: 'zoom_in',
        transition: 'wipe_right',
        transitionDuration: 1.0,
        subtitle: 'Superheated mineral vents spew 400°C smoke, powering ecosystems independent of the sun.',
        lowerThird: { title: 'ZONE 04: HYDROTHERMAL VENT', subtitle: '-6,500 METERS • 00:45' },
      },
      {
        id: 's-o5',
        sceneNumber: 5,
        title: 'The Challenger Deep',
        duration: 13.0,
        startTime: 65.0,
        assignedAssetId: 'v-ocean-5',
        scriptBeat: 'Eleven kilometers down, the water pressure exceeds one thousand atmospheres. Over eight tons per square inch.',
        visualPrompt: 'Titanium pressure sphere descending into the deepest trench on planet Earth, laser rangefinders measuring bottom proximity.',
        cameraMotion: 'zoom_out',
        transition: 'crossfade',
        transitionDuration: 1.0,
        subtitle: 'Eleven kilometers down, water pressure exceeds one thousand atmospheres.',
        lowerThird: { title: 'ZONE 05: HADAL TRENCH', subtitle: '-11,000 METERS • 01:05' },
      },
      {
        id: 's-o6',
        sceneNumber: 6,
        title: 'Life at the Boundary',
        duration: 12.0,
        startTime: 78.0,
        assignedAssetId: 'v-ocean-6',
        scriptBeat: 'Even here, in the deepest trench on Earth, translucent snailfish thrive in serene silence. The frontier remains alive.',
        visualPrompt: 'Gentle slow push-in on an ethereal translucent hadal snailfish floating effortlessly in pitch black depths, poetic closure.',
        cameraMotion: 'cinematic_drift',
        transition: 'dissolve_black',
        transitionDuration: 1.2,
        subtitle: 'Even here in the deepest trench, translucent snailfish thrive in serene silence.',
        lowerThird: { title: 'EPILOGUE', subtitle: 'CHALLENGER DEEP • 01:30' },
      },
    ],
  },
];
