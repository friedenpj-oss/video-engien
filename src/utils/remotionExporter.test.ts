import test from 'node:test';
import assert from 'node:assert/strict';
import { generateRemotionProjectBundle } from './remotionExporter';
import { STYLE_PRESETS } from '../data/styleLibrary';
import { DEFAULT_CAPTION_CONFIG } from '../data/fontLibrary';
import { VideoScene, VisualAsset, ProjectConfig } from '../types/index';

test('generateRemotionProjectBundle outputs valid Remotion and Hyperframe files', () => {
  const dummyScenes: VideoScene[] = [
    {
      id: 's1',
      sceneNumber: 1,
      title: 'Intro Drop',
      duration: 5.0,
      startTime: 0,
      scriptBeat: 'Check this out.',
      visualPrompt: 'Hero shot',
      cameraMotion: 'zoom_in',
      transition: 'crossfade',
      transitionDuration: 0.8,
      subtitle: 'Check this out.',
    },
    {
      id: 's2',
      sceneNumber: 2,
      title: 'Drop Climax',
      duration: 5.0,
      startTime: 5.0,
      scriptBeat: 'Maximum energy.',
      visualPrompt: 'High speed tracking',
      cameraMotion: 'pan_left',
      transition: 'wipe_right',
      transitionDuration: 0.8,
      subtitle: 'Maximum energy.',
    },
  ];

  const dummyVisuals: VisualAsset[] = [
    { id: 'v1', name: 'beat1.jpg', url: 'https://example.com/1.jpg', fileType: 'image/jpeg', aspectRatio: 'landscape', tags: ['energy'] }
  ];

  const dummyConfig: ProjectConfig = {
    title: 'Test Reel',
    targetDuration: 10,
    aspectRatio: '9:16',
    directorInstructions: 'Fast energy',
    style: 'social_reel',
    subtitlesEnabled: true,
    audioNarrationEnabled: true,
    bgMusicEnabled: true,
    musicMood: 'electronic_pulse',
  };

  const bundle = generateRemotionProjectBundle(
    dummyScenes,
    dummyVisuals,
    dummyConfig,
    STYLE_PRESETS[0],
    DEFAULT_CAPTION_CONFIG,
    30
  );

  // Assert required files exist in bundle
  assert.ok(bundle['Root.tsx'].includes('export const RemotionRoot'));
  assert.ok(bundle['Composition.tsx'].includes('export const MainComposition'));
  assert.ok(bundle['Subtitles.tsx'].includes('export const SubtitlesTrack'));
  assert.ok(bundle['package.json'].includes('"remotion"'));
  assert.ok(bundle['hyperframe.config.json'].includes('"hyperframeVersion": "2.0"'));

  const parsedHyperframe = JSON.parse(bundle['hyperframe.config.json']);
  assert.equal(parsedHyperframe.project.aspectRatio, '9:16');
  assert.equal(parsedHyperframe.tracks.length, 3);
});
