import { test, describe } from 'node:test';
import assert from 'node:assert';
import { drawTornPaperEdge, renderWondernitzBlock, renderArtistSpotlight } from './lyricCanvasRenderer.js';

describe('lyricCanvasRenderer tests', () => {
  test('drawTornPaperEdge executes without throwing on mock 2d context', () => {
    const mockCtx: any = {
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      quadraticCurveTo: () => {},
      closePath: () => {},
      fill: () => {},
      stroke: () => {},
      fillRect: () => {},
    };

    assert.doesNotThrow(() => {
      drawTornPaperEdge(mockCtx, 10, 0, 10, 100, 50, 'left', 123);
      drawTornPaperEdge(mockCtx, 0, 80, 200, 80, 40, 'bottom', 456);
    });
  });

  test('renderWondernitzBlock handles multi-line and single-line lyric strings', () => {
    const recordedText: string[] = [];
    const mockCtx: any = {
      save: () => {},
      restore: () => {},
      createRadialGradient: () => ({ addColorStop: () => {} }),
      createLinearGradient: () => ({ addColorStop: () => {} }),
      fillRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      quadraticCurveTo: () => {},
      closePath: () => {},
      fill: () => {},
      stroke: () => {},
      strokeRect: () => {},
      measureText: (str: string) => ({ width: str.length * 10 }),
      fillText: (text: string) => {
        recordedText.push(text);
      },
      strokeText: () => {},
      rect: () => {},
      clip: () => {},
      translate: () => {},
      rotate: () => {},
      scale: () => {},
      arc: () => {},
    };

    renderWondernitzBlock({
      ctx: mockCtx,
      width: 720,
      height: 1280,
      text: 'I NO FIT\nEVER\nSTAND FOR\nLINE',
      songMetadata: {
        trackTitle: 'ITALAWA',
        artistName: 'RABOSKI',
        releaseDate: '2025-06-12',
      },
      progress: 0.5,
      isPortrait: true,
      time: 1.2
    });

    // Should contain the Wondernitz lines and title
    assert.ok(recordedText.includes('I NO FIT'));
    assert.ok(recordedText.includes('EVER'));
    assert.ok(recordedText.includes('STAND FOR'));
    assert.ok(recordedText.includes('LINE'));
    assert.ok(recordedText.some(t => t.includes('ITALAWA')));
    assert.ok(recordedText.some(t => t.includes('RABOSKI')));
  });

  test('renderArtistSpotlight renders headline, credits and metadata', () => {
    const recordedText: string[] = [];
    const mockCtx: any = {
      save: () => {},
      restore: () => {},
      createRadialGradient: () => ({ addColorStop: () => {} }),
      createLinearGradient: () => ({ addColorStop: () => {} }),
      fillRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      quadraticCurveTo: () => {},
      closePath: () => {},
      fill: () => {},
      stroke: () => {},
      strokeRect: () => {},
      measureText: (str: string) => ({ width: str.length * 10 }),
      fillText: (text: string) => {
        recordedText.push(text);
      },
      strokeText: () => {},
      rect: () => {},
      roundRect: () => {},
      clip: () => {},
      translate: () => {},
      rotate: () => {},
      scale: () => {},
      arc: () => {},
      drawImage: () => {},
    };

    renderArtistSpotlight({
      ctx: mockCtx,
      width: 720,
      height: 1280,
      text: 'MIXING & MASTERING',
      songMetadata: {
        trackTitle: 'ITALAWA',
        artistName: 'RABOSKI',
        songwriters: 'Raboski, Wondernitz',
        producers: 'Raboski MasterLab',
        releaseDate: '2025-06-12',
        tagline: 'ONE ARTIST. EVERY LAYER.',
        trackNumber: '04 / 04',
      },
      progress: 0.5,
      isPortrait: true,
      time: 1.2
    });

    assert.ok(recordedText.some(t => t.includes('MIXING &')));
    assert.ok(recordedText.some(t => t.includes('MASTERING')));
    assert.ok(recordedText.some(t => t.includes('ONE ARTIST')));
    assert.ok(recordedText.some(t => t.includes('04 / 04')));
    assert.ok(recordedText.some(t => t.includes('RABOSKI')));
  });
});
