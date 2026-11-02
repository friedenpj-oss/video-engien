import { VideoScene } from '../types/index';

/**
 * Recalculates start times for an array of scenes sequentially.
 */
export function computeSceneTimings(scenes: VideoScene[], targetDuration?: number): VideoScene[] {
  if (!scenes || scenes.length === 0) return [];

  let accumulated = 0;
  return scenes.map((scene, idx) => {
    const validDuration = Math.max(0.5, Number(scene.duration) || 3);
    const updated: VideoScene = {
      ...scene,
      sceneNumber: idx + 1,
      duration: Number(validDuration.toFixed(2)),
      startTime: Number(accumulated.toFixed(2)),
    };
    accumulated += validDuration;
    return updated;
  });
}

/**
 * Calculates total duration of all scenes combined.
 */
export function getTotalDuration(scenes: VideoScene[]): number {
  if (!scenes || scenes.length === 0) return 0;
  const total = scenes.reduce((sum, s) => sum + (Math.max(0.5, Number(s.duration) || 3)), 0);
  return Number(total.toFixed(2));
}

/**
 * Rescales all scene durations proportionally to fit an exact target duration (e.g. 30s, 60s, 90s).
 */
export function rescaleTimeline(scenes: VideoScene[], newTargetDuration: number): VideoScene[] {
  if (!scenes || scenes.length === 0) return [];
  const currentTotal = getTotalDuration(scenes);
  if (currentTotal <= 0) return scenes;

  const ratio = newTargetDuration / currentTotal;
  let accumulated = 0;

  return scenes.map((scene, idx) => {
    // For the last scene, snap to exact target duration to prevent rounding drift
    let sceneDuration: number;
    if (idx === scenes.length - 1) {
      sceneDuration = Math.max(0.5, newTargetDuration - accumulated);
    } else {
      sceneDuration = Math.max(0.5, Number((scene.duration * ratio).toFixed(2)));
    }
    const updated: VideoScene = {
      ...scene,
      sceneNumber: idx + 1,
      duration: Number(sceneDuration.toFixed(2)),
      startTime: Number(accumulated.toFixed(2)),
    };
    accumulated += sceneDuration;
    return updated;
  });
}

export interface TimelineState {
  activeScene: VideoScene | null;
  activeSceneIndex: number;
  nextScene: VideoScene | null;
  sceneProgress: number; // 0.0 to 1.0 within active scene
  inTransition: boolean;
  transitionProgress: number; // 0.0 to 1.0 during transition to next scene
}

/**
 * Given a timestamp in seconds, returns active scene, transition state, and interpolation progress.
 */
export function getTimelineState(scenes: VideoScene[], currentTime: number): TimelineState {
  if (!scenes || scenes.length === 0) {
    return {
      activeScene: null,
      activeSceneIndex: -1,
      nextScene: null,
      sceneProgress: 0,
      inTransition: false,
      transitionProgress: 0,
    };
  }

  const clampedTime = Math.max(0, Math.min(currentTime, getTotalDuration(scenes)));

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const sceneEnd = scene.startTime + scene.duration;

    // Check if within this scene (or last scene boundary)
    if (clampedTime >= scene.startTime && (clampedTime < sceneEnd || i === scenes.length - 1)) {
      const elapsed = clampedTime - scene.startTime;
      const sceneProgress = Math.min(1, Math.max(0, elapsed / scene.duration));

      const nextScene = i < scenes.length - 1 ? scenes[i + 1] : null;
      const transDuration = Math.min(scene.transitionDuration || 0.8, scene.duration * 0.5);
      const timeUntilEnd = sceneEnd - clampedTime;

      let inTransition = false;
      let transitionProgress = 0;

      if (nextScene && timeUntilEnd <= transDuration && transDuration > 0) {
        inTransition = true;
        transitionProgress = Math.min(1, Math.max(0, 1 - (timeUntilEnd / transDuration)));
      }

      return {
        activeScene: scene,
        activeSceneIndex: i,
        nextScene,
        sceneProgress,
        inTransition,
        transitionProgress,
      };
    }
  }

  // Fallback to first scene
  return {
    activeScene: scenes[0],
    activeSceneIndex: 0,
    nextScene: scenes[1] || null,
    sceneProgress: 0,
    inTransition: false,
    transitionProgress: 0,
  };
}

/**
 * Formats seconds into MM:SS.S format (e.g. 00:24.5).
 */
export function formatTimecode(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00.0';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const tenths = Math.floor((seconds % 1) * 10);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(mins)}:${pad(secs)}.${tenths}`;
}

/**
 * Moves scene from one index to another.
 */
export function reorderScenes(scenes: VideoScene[], fromIndex: number, toIndex: number): VideoScene[] {
  if (fromIndex < 0 || fromIndex >= scenes.length || toIndex < 0 || toIndex >= scenes.length) {
    return scenes;
  }
  const result = [...scenes];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return computeSceneTimings(result);
}
