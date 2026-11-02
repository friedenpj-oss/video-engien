import test from 'node:test';
import assert from 'node:assert/strict';
import { understandScriptLocally } from './localIntelligence';
import { STYLE_PRESETS } from '../data/styleLibrary';
import { VisualAsset } from '../types/index';
import { getTotalDuration } from './timelineEngine';

test('understandScriptLocally processes script offline without external API', () => {
  const script = `# Beat 1: The Intro
A stunning aerial view of the coastline at dawn.

# Beat 2: The Action
The sports car accelerates down the winding highway cliffside.

# Beat 3: The Drop
Bass kicks in with neon city lights reflecting off the wet pavement.

# Beat 4: Finale
Engine roars into the distance with our logo reveal.`;

  const visuals: VisualAsset[] = [
    { id: 'v1', name: 'coastline_dawn.jpg', url: 'https://example.com/v1.jpg', fileType: 'image/jpeg', aspectRatio: 'landscape', tags: ['coastline', 'aerial', 'dawn'] },
    { id: 'v2', name: 'sports_car_highway.jpg', url: 'https://example.com/v2.jpg', fileType: 'image/jpeg', aspectRatio: 'landscape', tags: ['car', 'highway', 'action'] },
    { id: 'v3', name: 'neon_city_night.jpg', url: 'https://example.com/v3.jpg', fileType: 'image/jpeg', aspectRatio: 'landscape', tags: ['neon', 'city', 'lights'] },
  ];

  const shortReelStyle = STYLE_PRESETS[0]; // Short Reel
  const result = understandScriptLocally(script, visuals, 30, shortReelStyle);

  assert.ok(result.scenes.length >= 3, `Expected at least 3 scenes, got ${result.scenes.length}`);
  const total = getTotalDuration(result.scenes);
  assert.ok(Math.abs(total - 30) < 0.5, `Expected ~30s total, got ${total}`);

  // Check asset matching
  assert.equal(result.scenes[0].assignedAssetId, 'v1'); // coastline
  assert.ok(result.analysisNotes.length > 0);
});
