import { VideoScene, VisualAsset, CameraMotion, TransitionType } from '../types/index';

const CAMERA_MOTIONS: CameraMotion[] = [
  'zoom_in',
  'pan_left',
  'zoom_out',
  'cinematic_drift',
  'pan_right',
  'tilt_up',
  'orbit'
];

const TRANSITION_TYPES: TransitionType[] = [
  'crossfade',
  'dissolve_black',
  'wipe_right',
  'zoom_in'
];

/**
 * Splits plain text or markdown into distinct narrative beats or scene chunks.
 */
export function extractScriptParagraphs(rawText: string): string[] {
  if (!rawText || !rawText.trim()) return [];

  // Remove markdown headers or treat them as natural delimiters
  const clean = rawText
    .replace(/\r\n/g, '\n')
    .replace(/^#+\s+/gm, '') // remove markdown heading hashes
    .trim();

  // Split by double line breaks or scene identifiers
  const blocks = clean.split(/\n\s*\n+/);
  const result: string[] = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (trimmed.length > 0) {
      // If block contains lines starting with Scene 1:, Scene 2:, or INT./EXT., split them
      const sceneMatches = trimmed.split(/(?=(?:Scene\s*\d+|INT\.|EXT\.|Beat\s*\d+|Act\s*\d+):?)/i);
      for (const m of sceneMatches) {
        const line = m.trim();
        if (line.length > 0) {
          result.push(line);
        }
      }
    }
  }

  return result.length > 0 ? result : [clean];
}

/**
 * Matches a scene text against uploaded visual assets using keyword heuristics.
 */
export function findBestVisualMatch(text: string, assets: VisualAsset[]): VisualAsset | undefined {
  if (!assets || assets.length === 0) return undefined;

  const lowerText = text.toLowerCase();
  let bestScore = -1;
  let bestAsset: VisualAsset | undefined = undefined;

  for (const asset of assets) {
    let score = 0;
    // Check asset name tokens
    const nameTokens = asset.name.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/);
    for (const token of nameTokens) {
      if (token.length > 2 && lowerText.includes(token)) {
        score += 3;
      }
    }
    // Check tags
    for (const tag of asset.tags) {
      if (lowerText.includes(tag.toLowerCase())) {
        score += 2;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestAsset = asset;
    }
  }

  // If no good match, return first or distribute by index
  return bestScore > 0 ? bestAsset : undefined;
}

/**
 * Generates structured VideoScene list given script text, assets, and target duration.
 */
export function generateHeuristicScenes(
  scriptText: string,
  assets: VisualAsset[],
  targetDuration: number = 30,
  directorNotes: string = ''
): VideoScene[] {
  const paragraphs = extractScriptParagraphs(scriptText);
  
  // Decide target scene count based on duration:
  // e.g. 30s -> ~5-6 scenes (5s each)
  // 60s -> ~8-10 scenes (6s each)
  // 90s -> ~12-14 scenes (6.5s each)
  const targetSceneCount = Math.max(3, Math.round(targetDuration / 5.5));
  
  let chunks: string[] = [];
  if (paragraphs.length >= targetSceneCount) {
    // Group paragraphs into targetSceneCount
    const itemsPerChunk = Math.ceil(paragraphs.length / targetSceneCount);
    for (let i = 0; i < paragraphs.length; i += itemsPerChunk) {
      chunks.push(paragraphs.slice(i, i + itemsPerChunk).join(' '));
    }
  } else if (paragraphs.length > 0) {
    // Split long paragraphs if needed
    for (const p of paragraphs) {
      const sentences = p.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 0);
      if (sentences.length > 2 && chunks.length + sentences.length <= targetSceneCount) {
        chunks.push(...sentences);
      } else {
        chunks.push(p);
      }
    }
    // If still fewer than targetSceneCount, fill or split
    while (chunks.length < targetSceneCount && chunks.some(c => c.length > 60)) {
      const longestIdx = chunks.reduce((maxI, c, i, arr) => c.length > arr[maxI].length ? i : maxI, 0);
      const longest = chunks[longestIdx];
      const mid = Math.floor(longest.length / 2);
      const splitAt = longest.indexOf(' ', mid);
      if (splitAt > 0) {
        const p1 = longest.slice(0, splitAt).trim();
        const p2 = longest.slice(splitAt).trim();
        chunks.splice(longestIdx, 1, p1, p2);
      } else {
        break;
      }
    }
  } else {
    // Fallback default chunks
    chunks = [
      'Welcome to the future of continuous video creation. Every frame flows seamlessly into the next.',
      'Integrating your visual reference library with dynamic camera choreography and precise pacing.',
      'High-impact visual beats synchronized with atmospheric lighting and cinematic motion.',
      'From raw guidelines and assets to a broadcast-ready continuous timeline.'
    ];
  }

  // Ensure count matches roughly
  const count = chunks.length;
  const nominalDuration = targetDuration / count;

  let accumulatedTime = 0;
  const scenes: VideoScene[] = [];

  for (let i = 0; i < count; i++) {
    const chunk = chunks[i];
    const duration = i === count - 1 
      ? Math.max(1.0, targetDuration - accumulatedTime)
      : Number(nominalDuration.toFixed(1));

    // Match visual asset
    let assignedAsset: VisualAsset | undefined = findBestVisualMatch(chunk, assets);
    if (!assignedAsset && assets.length > 0) {
      assignedAsset = assets[i % assets.length];
    }

    const cameraMotion = CAMERA_MOTIONS[i % CAMERA_MOTIONS.length];
    const transition = i === count - 1 ? 'crossfade' : TRANSITION_TYPES[i % TRANSITION_TYPES.length];

    // Extract first few words as short title
    const words = chunk.replace(/[^a-zA-Z0-9 ]/g, '').split(/\s+/).filter(Boolean);
    const title = words.slice(0, 4).join(' ') || `Scene ${i + 1}`;

    // Prompt generator
    const visualPrompt = assignedAsset
      ? `Cinematic shot inspired by visual reference "${assignedAsset.name}": dynamic ${cameraMotion.replace('_', ' ')}, volumetric atmosphere, 4K crisp texture, professional color grade.`
      : `High-definition cinematic capture: ${title}, ${cameraMotion.replace('_', ' ')} movement, studio lighting, photorealistic.`;

    scenes.push({
      id: `scene-${i + 1}-${Date.now().toString(36)}`,
      sceneNumber: i + 1,
      title: title.charAt(0).toUpperCase() + title.slice(1),
      duration,
      startTime: Number(accumulatedTime.toFixed(2)),
      assignedAssetId: assignedAsset?.id,
      scriptBeat: chunk,
      visualPrompt,
      cameraMotion,
      transition,
      transitionDuration: 0.8,
      subtitle: chunk.length > 90 ? chunk.slice(0, 87) + '...' : chunk,
      lowerThird: {
        title: title.toUpperCase(),
        subtitle: `Beat 0${i + 1} • ${duration}s`
      }
    });

    accumulatedTime += duration;
  }

  return scenes;
}
