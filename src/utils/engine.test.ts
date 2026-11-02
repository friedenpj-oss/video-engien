import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  computeSceneTimings, 
  getTotalDuration, 
  rescaleTimeline, 
  getTimelineState, 
  formatTimecode,
  reorderScenes 
} from './timelineEngine';
import { extractScriptParagraphs, findBestVisualMatch, generateHeuristicScenes } from './scriptParser';
import { VideoScene, VisualAsset } from '../types/index';

test('timelineEngine computes scene timings and total duration accurately', () => {
  const dummyScenes: VideoScene[] = [
    {
      id: 's1',
      sceneNumber: 1,
      title: 'Intro',
      duration: 5,
      startTime: 0,
      scriptBeat: 'Welcome',
      visualPrompt: 'Prompt 1',
      cameraMotion: 'zoom_in',
      transition: 'crossfade',
      transitionDuration: 0.8,
      subtitle: 'Welcome'
    },
    {
      id: 's2',
      sceneNumber: 2,
      title: 'Middle',
      duration: 10,
      startTime: 0, // needs recalculation
      scriptBeat: 'Middle beat',
      visualPrompt: 'Prompt 2',
      cameraMotion: 'pan_left',
      transition: 'wipe_right',
      transitionDuration: 0.8,
      subtitle: 'Middle beat'
    }
  ];

  const timed = computeSceneTimings(dummyScenes);
  assert.equal(timed[0].startTime, 0);
  assert.equal(timed[0].duration, 5);
  assert.equal(timed[1].startTime, 5);
  assert.equal(timed[1].duration, 10);
  assert.equal(getTotalDuration(timed), 15);
});

test('rescaleTimeline proportionally scales scenes to fit exact target duration', () => {
  const scenes: VideoScene[] = [
    {
      id: 's1',
      sceneNumber: 1,
      title: 'Scene 1',
      duration: 5,
      startTime: 0,
      scriptBeat: 'One',
      visualPrompt: 'Prompt',
      cameraMotion: 'zoom_in',
      transition: 'crossfade',
      transitionDuration: 0.8,
      subtitle: 'One'
    },
    {
      id: 's2',
      sceneNumber: 2,
      title: 'Scene 2',
      duration: 5,
      startTime: 5,
      scriptBeat: 'Two',
      visualPrompt: 'Prompt',
      cameraMotion: 'pan_left',
      transition: 'crossfade',
      transitionDuration: 0.8,
      subtitle: 'Two'
    }
  ];

  const rescaledTo60 = rescaleTimeline(scenes, 60);
  assert.equal(getTotalDuration(rescaledTo60), 60);
  assert.equal(rescaledTo60[0].duration, 30);
  assert.equal(rescaledTo60[1].duration, 30);

  const rescaledTo90 = rescaleTimeline(scenes, 90);
  assert.equal(getTotalDuration(rescaledTo90), 90);
});

test('getTimelineState identifies current active scene and transition progress correctly', () => {
  const scenes: VideoScene[] = [
    {
      id: 's1',
      sceneNumber: 1,
      title: 'Scene 1',
      duration: 10,
      startTime: 0,
      scriptBeat: 'Beat 1',
      visualPrompt: 'Prompt',
      cameraMotion: 'zoom_in',
      transition: 'crossfade',
      transitionDuration: 1.0,
      subtitle: 'Beat 1'
    },
    {
      id: 's2',
      sceneNumber: 2,
      title: 'Scene 2',
      duration: 10,
      startTime: 10,
      scriptBeat: 'Beat 2',
      visualPrompt: 'Prompt',
      cameraMotion: 'zoom_out',
      transition: 'crossfade',
      transitionDuration: 1.0,
      subtitle: 'Beat 2'
    }
  ];

  // At 5.0 seconds: middle of scene 1, no transition
  const midState = getTimelineState(scenes, 5.0);
  assert.equal(midState.activeSceneIndex, 0);
  assert.equal(midState.inTransition, false);
  assert.equal(midState.sceneProgress, 0.5);

  // At 9.5 seconds: within 1.0s transition window before scene 2
  const transState = getTimelineState(scenes, 9.5);
  assert.equal(transState.activeSceneIndex, 0);
  assert.equal(transState.inTransition, true);
  assert.ok(transState.transitionProgress > 0.4 && transState.transitionProgress < 0.6);

  // At 12.0 seconds: inside scene 2
  const scene2State = getTimelineState(scenes, 12.0);
  assert.equal(scene2State.activeSceneIndex, 1);
  assert.equal(scene2State.inTransition, false);
});

test('formatTimecode formats minutes, seconds and tenths correctly', () => {
  assert.equal(formatTimecode(0), '00:00.0');
  assert.equal(formatTimecode(9.4), '00:09.4');
  assert.equal(formatTimecode(65.2), '01:05.2');
  assert.equal(formatTimecode(90), '01:30.0');
});

test('reorderScenes moves scenes and updates sequence order and start times', () => {
  const scenes: VideoScene[] = [
    { id: '1', sceneNumber: 1, title: 'First', duration: 4, startTime: 0, scriptBeat: 'A', visualPrompt: '', cameraMotion: 'zoom_in', transition: 'crossfade', transitionDuration: 0.8, subtitle: '' },
    { id: '2', sceneNumber: 2, title: 'Second', duration: 6, startTime: 4, scriptBeat: 'B', visualPrompt: '', cameraMotion: 'zoom_in', transition: 'crossfade', transitionDuration: 0.8, subtitle: '' },
  ];

  const swapped = reorderScenes(scenes, 0, 1);
  assert.equal(swapped[0].id, '2');
  assert.equal(swapped[0].startTime, 0);
  assert.equal(swapped[0].sceneNumber, 1);
  assert.equal(swapped[1].id, '1');
  assert.equal(swapped[1].startTime, 6);
  assert.equal(swapped[1].sceneNumber, 2);
});

test('scriptParser handles markdown, headings and chunks paragraphs', () => {
  const markdown = `# Scene 1: Sunrise
The golden dawn illuminates the coastal cliffside.

# Scene 2: The Journey
An autonomous drone takes flight, gliding over the crashing turquoise waves.

# Scene 3: Conclusion
Reaching the destination with absolute precision.`;

  const paragraphs = extractScriptParagraphs(markdown);
  assert.equal(paragraphs.length, 3);
  assert.ok(paragraphs[0].includes('Sunrise'));
  assert.ok(paragraphs[1].includes('drone takes flight'));
});

test('findBestVisualMatch matches asset by keyword relevance', () => {
  const mockAssets: VisualAsset[] = [
    { id: 'a1', name: 'coastal_cliff_drone.jpg', fileType: 'image/jpeg', url: 'blob:...', aspectRatio: 'landscape', tags: ['drone', 'coastal', 'ocean'] },
    { id: 'a2', name: 'city_neon_night.png', fileType: 'image/png', url: 'blob:...', aspectRatio: 'landscape', tags: ['cyberpunk', 'city', 'neon'] }
  ];

  const match1 = findBestVisualMatch('Gliding high above the ocean cliff with a camera drone', mockAssets);
  assert.equal(match1?.id, 'a1');

  const match2 = findBestVisualMatch('Driving through neon glowing city avenues at midnight', mockAssets);
  assert.equal(match2?.id, 'a2');
});

test('generateHeuristicScenes generates continuous timeline matching target duration', () => {
  const script = 'The beginning starts here. The story develops into a captivating narrative. The climax reveals the unexpected innovation. The closing shot leaves a lasting impression.';
  const mockAssets: VisualAsset[] = [
    { id: 'img1', name: 'shot1.jpg', fileType: 'image/jpeg', url: '', aspectRatio: 'landscape', tags: ['story'] }
  ];

  const scenes30 = generateHeuristicScenes(script, mockAssets, 30);
  const total30 = getTotalDuration(scenes30);
  assert.ok(Math.abs(total30 - 30) < 0.2, `Expected ~30s, got ${total30}`);

  const scenes60 = generateHeuristicScenes(script, mockAssets, 60);
  const total60 = getTotalDuration(scenes60);
  assert.ok(Math.abs(total60 - 60) < 0.2, `Expected ~60s, got ${total60}`);
});
