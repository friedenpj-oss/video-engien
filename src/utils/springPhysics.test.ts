import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSpring, interpolate } from './springPhysics';

test('calculateSpring starts at from value and settles at to value', () => {
  const atZero = calculateSpring({ frame: 0, fps: 30, from: 0, to: 1 });
  assert.equal(atZero, 0);

  const atFrame10 = calculateSpring({ frame: 10, fps: 30, from: 0, to: 1 });
  assert.ok(atFrame10 > 0.1 && atFrame10 < 1.3, `Expected progress, got ${atFrame10}`);

  // After 60 frames (2 seconds at 30fps), spring should have settled close to 1.0
  const settled = calculateSpring({ frame: 60, fps: 30, from: 0, to: 1 });
  assert.ok(Math.abs(settled - 1.0) < 0.05, `Expected ~1.0, got ${settled}`);
});

test('interpolate clamps and maps input range correctly', () => {
  // Linear mapping [0, 10] -> [100, 200]
  assert.equal(interpolate(0, [0, 10], [100, 200]), 100);
  assert.equal(interpolate(5, [0, 10], [100, 200]), 150);
  assert.equal(interpolate(10, [0, 10], [100, 200]), 200);

  // Clamping outside bounds
  assert.equal(interpolate(-5, [0, 10], [100, 200]), 100);
  assert.equal(interpolate(25, [0, 10], [100, 200]), 200);
});
