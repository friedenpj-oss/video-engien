import { VideoScene, VisualAsset, CameraMotion, TransitionType } from '../types/index';
import { StylePreset } from '../types/styles';
import { extractScriptParagraphs } from './scriptParser';
import { rescaleTimeline, computeSceneTimings } from './timelineEngine';

/**
 * Parses, understands, and structures scripts locally without any LLM connection.
 */
export function understandScriptLocally(
  rawScript: string,
  visuals: VisualAsset[],
  targetDuration: number,
  style: StylePreset,
  directorNotes: string = ''
): { scenes: VideoScene[]; analysisNotes: string[]; summary: string } {
  const paragraphs = extractScriptParagraphs(rawScript);

  // Determine beat cadence based on style
  let averageBeatDuration = 5.5;
  if (style.category === 'short_reel') averageBeatDuration = 3.8;
  else if (style.category === 'music_video') averageBeatDuration = 3.2;
  else if (style.category === 'cinematic') averageBeatDuration = 7.5;
  else if (style.category === 'commercial') averageBeatDuration = 5.0;

  const targetSceneCount = Math.max(3, Math.round(targetDuration / averageBeatDuration));

  // Partition paragraphs into structured beats
  const beats: string[] = [];
  if (paragraphs.length >= targetSceneCount) {
    const itemsPerBeat = Math.ceil(paragraphs.length / targetSceneCount);
    for (let i = 0; i < paragraphs.length; i += itemsPerBeat) {
      beats.push(paragraphs.slice(i, i + itemsPerBeat).join(' '));
    }
  } else if (paragraphs.length > 0) {
    for (const p of paragraphs) {
      // Split by sentences if needed
      const sentences = p.split(/(?<=[.?!])\s+/).filter(Boolean);
      if (sentences.length > 1 && beats.length + sentences.length <= targetSceneCount) {
        beats.push(...sentences);
      } else {
        beats.push(p);
      }
    }
    // Fill remaining if needed
    while (beats.length < targetSceneCount && beats.some(b => b.length > 50)) {
      const idx = beats.reduce((maxI, b, i, arr) => b.length > arr[maxI].length ? i : maxI, 0);
      const longest = beats[idx];
      const mid = Math.floor(longest.length / 2);
      const splitAt = longest.indexOf(' ', mid);
      if (splitAt > 0) {
        beats.splice(idx, 1, longest.slice(0, splitAt).trim(), longest.slice(splitAt).trim());
      } else {
        break;
      }
    }
  } else {
    // Default fallback beats
    beats.push(
      'Opening sequence: Setting the atmosphere and narrative tone.',
      'Core progression: Developing kinetic pace with visual synchronicity.',
      'Climax moment: High-impact cinematic revelation.',
      'Finale: Sustained emotional resonance and closing title card.'
    );
  }

  const scenes: VideoScene[] = [];
  const baseDuration = targetDuration / beats.length;
  let accumulatedTime = 0;

  // Camera choreography rotation based on style
  const motionPresets: CameraMotion[] = style.category === 'short_reel'
    ? ['zoom_in', 'pan_right', 'zoom_out', 'tilt_up', 'zoom_in']
    : style.category === 'cinematic'
    ? ['cinematic_drift', 'pan_left', 'zoom_in', 'tilt_up', 'zoom_out']
    : style.category === 'music_video'
    ? ['zoom_in', 'orbit', 'zoom_out', 'pan_left', 'tilt_up']
    : ['zoom_in', 'pan_left', 'cinematic_drift', 'zoom_out'];

  const transitions: TransitionType[] = style.category === 'music_video'
    ? ['zoom_in', 'wipe_right', 'dissolve_black', 'crossfade']
    : style.category === 'short_reel'
    ? ['wipe_right', 'zoom_in', 'crossfade']
    : ['crossfade', 'dissolve_black', 'crossfade'];

  for (let i = 0; i < beats.length; i++) {
    const text = beats[i];
    const duration = i === beats.length - 1
      ? Math.max(1.0, targetDuration - accumulatedTime)
      : Number(baseDuration.toFixed(1));

    // Match visual asset locally
    let assignedAsset: VisualAsset | undefined;
    if (visuals.length > 0) {
      // Keyword matching
      const lower = text.toLowerCase();
      let bestScore = -1;
      for (const v of visuals) {
        let score = 0;
        const tokens = v.name.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/);
        for (const tok of tokens) {
          if (tok.length > 2 && lower.includes(tok)) score += 3;
        }
        for (const tag of v.tags) {
          if (lower.includes(tag.toLowerCase())) score += 2;
        }
        // Aspect ratio preference matching
        const isAspectMatch = (style.aspectRatioDefault === '9:16' && v.aspectRatio === 'portrait') ||
                              (style.aspectRatioDefault === '16:9' && v.aspectRatio === 'landscape');
        if (isAspectMatch) score += 1;

        if (score > bestScore) {
          bestScore = score;
          assignedAsset = v;
        }
      }
      if (!assignedAsset || bestScore <= 0) {
        assignedAsset = visuals[i % visuals.length];
      }
    }

    const words = text.replace(/[^a-zA-Z0-9 ]/g, '').split(/\s+/).filter(Boolean);
    const title = words.slice(0, 4).join(' ') || `Scene ${i + 1}`;
    const cameraMotion = motionPresets[i % motionPresets.length];
    const transition = i === beats.length - 1 ? 'crossfade' : transitions[i % transitions.length];

    const visualPrompt = assignedAsset
      ? `High-fidelity ${style.category} shot referencing "${assignedAsset.name}": ${cameraMotion.replace('_', ' ')} camera dynamics, ${style.lutFilter.replace('_', ' ')} grading, photorealistic, 4K.`
      : `High-definition ${style.category} sequence: ${title}, ${cameraMotion.replace('_', ' ')} movement, studio lighting.`;

    scenes.push({
      id: `scene-local-${i + 1}-${Date.now().toString(36)}`,
      sceneNumber: i + 1,
      title: title.charAt(0).toUpperCase() + title.slice(1),
      duration,
      startTime: Number(accumulatedTime.toFixed(2)),
      assignedAssetId: assignedAsset?.id,
      scriptBeat: text,
      visualPrompt,
      cameraMotion,
      transition,
      transitionDuration: style.category === 'music_video' ? 0.4 : 0.8,
      subtitle: text.length > 90 ? text.slice(0, 87) + '...' : text,
      lowerThird: {
        title: title.toUpperCase(),
        subtitle: `BEAT 0${i + 1} • ${duration}s`,
      },
    });

    accumulatedTime += duration;
  }

  const rescaled = rescaleTimeline(scenes, targetDuration);

  return {
    scenes: rescaled,
    summary: `Structured ${rescaled.length} continuous scene beats locally using ${style.name} pacing rules.`,
    analysisNotes: [
      `Local offline intelligence generated ${rescaled.length} synchronized beats.`,
      `Applied ${style.name} (${style.aspectRatioDefault}) spring dynamics and transition curve.`,
      `Calibrated runtime to exact target duration of ${targetDuration} seconds.`,
      visuals.length > 0 ? `Matched ${visuals.length} visual references across all narrative beats.` : 'Ready for visual reference assignment.',
    ],
  };
}
