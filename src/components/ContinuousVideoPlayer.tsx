import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Monitor, 
  Smartphone,
  Eye,
  MessageSquare
} from 'lucide-react';
import { VideoScene, VisualAsset, AspectRatio, ProjectConfig } from '../types/index';
import { StylePreset, CaptionConfig } from '../types/styles';
import { getTimelineState, getTotalDuration, formatTimecode } from '../utils/timelineEngine';
import { calculateSpring } from '../utils/springPhysics';
import { audioSynth } from '../utils/audioSynthesizer';
import { 
  renderWondernitzBlock, 
  renderArtistSpotlight, 
  renderPerspective3D, 
  renderProceduralBackground 
} from '../utils/lyricCanvasRenderer';

interface ContinuousVideoPlayerProps {
  scenes: VideoScene[];
  visuals: VisualAsset[];
  config: ProjectConfig;
  stylePreset?: StylePreset;
  captionConfig?: CaptionConfig;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onSelectScene: (sceneId: string) => void;
  selectedSceneId: string | null;
  canvasRefOut?: React.RefObject<HTMLCanvasElement | null>;
}

export const ContinuousVideoPlayer: React.FC<ContinuousVideoPlayerProps> = ({
  scenes,
  visuals,
  config,
  stylePreset,
  captionConfig,
  currentTime,
  onTimeUpdate,
  onSelectScene,
  selectedSceneId,
  canvasRefOut,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);

  // Asset image cache: assetId -> HTMLImageElement
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const artistImageRef = useRef<HTMLImageElement | null>(null);
  const lastActiveSceneIdRef = useRef<string | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  const totalDuration = getTotalDuration(scenes) || config.targetDuration;

  // Preload artist image for spotlight mode
  useEffect(() => {
    const artistUrl = config.songMetadata?.artistPhotoUrl || '/assets/aistudio/Raboski__Mixing___Mastering-8_144cdb4c.png';
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = artistUrl;
    img.onload = () => {
      artistImageRef.current = img;
    };
  }, [config.songMetadata?.artistPhotoUrl]);

  // Preload visual assets into HTMLImageElement cache
  useEffect(() => {
    visuals.forEach(asset => {
      if (!imageCacheRef.current.has(asset.id)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = asset.url;
        img.onload = () => {
          imageCacheRef.current.set(asset.id, img);
        };
      }
    });
  }, [visuals]);

  // Handle Play/Pause audio sync
  useEffect(() => {
    if (isPlaying) {
      if (config.bgMusicEnabled && !isMuted) {
        audioSynth.startMusic(config.musicMood);
      }
    } else {
      audioSynth.stopAll();
      lastActiveSceneIdRef.current = null;
    }
    return () => {
      audioSynth.stopAll();
    };
  }, [isPlaying, config.bgMusicEnabled, config.musicMood, isMuted]);

  // Handle canvas rendering frame
  const renderFrame = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isPortrait = config.aspectRatio === '9:16';
    const width = isPortrait ? 720 : 1280;
    const height = isPortrait ? 1280 : 720;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // Clear canvas
    ctx.fillStyle = '#0a0b0e';
    ctx.fillRect(0, 0, width, height);

    if (scenes.length === 0) {
      // Empty state
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '24px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No scenes in timeline. Add scenes or load a sample project.', width / 2, height / 2);
      return;
    }

    const state = getTimelineState(scenes, time);
    const { activeScene, nextScene, sceneProgress, inTransition, transitionProgress } = state;

    if (!activeScene) return;

    // Check if active scene changed during playback -> trigger speech narration
    if (isPlaying && activeScene.id !== lastActiveSceneIdRef.current) {
      lastActiveSceneIdRef.current = activeScene.id;
      if (config.audioNarrationEnabled && !isMuted) {
        audioSynth.speakNarration(activeScene.scriptBeat, true);
      }
    }

    // Helper to draw a scene's visual with Ken Burns motion
    const drawSceneImage = (scene: VideoScene, progress: number, alpha: number) => {
      const asset = visuals.find(v => v.id === scene.assignedAssetId);
      const img = asset ? imageCacheRef.current.get(asset.id) : null;

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

      // Calculate Ken Burns transform
      let scale = 1.0;
      let panX = 0;
      let panY = 0;

      switch (scene.cameraMotion) {
        case 'zoom_in':
          scale = 1.05 + progress * 0.12;
          break;
        case 'zoom_out':
          scale = 1.17 - progress * 0.12;
          break;
        case 'pan_left':
          scale = 1.1;
          panX = (0.5 - progress) * width * 0.08;
          break;
        case 'pan_right':
          scale = 1.1;
          panX = (progress - 0.5) * width * 0.08;
          break;
        case 'tilt_up':
          scale = 1.1;
          panY = (0.5 - progress) * height * 0.08;
          break;
        case 'cinematic_drift':
          scale = 1.06 + progress * 0.06;
          panX = Math.sin(progress * Math.PI) * width * 0.03;
          panY = Math.cos(progress * Math.PI) * height * 0.02;
          break;
        case 'orbit':
          scale = 1.08 + progress * 0.05;
          ctx.translate(width / 2, height / 2);
          ctx.rotate((progress - 0.5) * 0.04);
          ctx.translate(-width / 2, -height / 2);
          break;
        case 'static':
        default:
          scale = 1.02;
          break;
      }

      ctx.translate(width / 2 + panX, height / 2 + panY);
      ctx.scale(scale, scale);
      ctx.translate(-width / 2, -height / 2);

      if (img && img.complete && img.naturalWidth > 0) {
        // Calculate aspect-ratio cover crop
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const targetRatio = width / height;
        let sWidth = img.naturalWidth;
        let sHeight = img.naturalHeight;
        let sx = 0;
        let sy = 0;

        if (imgRatio > targetRatio) {
          sWidth = img.naturalHeight * targetRatio;
          sx = (img.naturalWidth - sWidth) / 2;
        } else {
          sHeight = img.naturalWidth / targetRatio;
          sy = (img.naturalHeight - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);
      } else {
        // Styled placeholder card if image is loading or missing
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#181b24');
        grad.addColorStop(1, '#0e1017');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#f43f5e';
        ctx.font = `bold ${Math.round(width * 0.035)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(scene.title || `Scene ${scene.sceneNumber}`, width / 2, height / 2 - 20);

        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = `${Math.round(width * 0.02)}px sans-serif`;
        ctx.fillText(`Camera: ${scene.cameraMotion.replace('_', ' ')} • Duration: ${scene.duration}s`, width / 2, height / 2 + 25);
      }

      ctx.restore();
    };

    // Handle background layer (Procedural / Video / Image)
    const bgMode = config.backgroundType || (stylePreset?.lyricLayoutMode ? 'procedural' : 'picture');
    
    if (bgMode === 'procedural' && (stylePreset?.proceduralTheme || config.proceduralBgStyle)) {
      renderProceduralBackground(
        ctx,
        config.proceduralBgStyle || stylePreset?.proceduralTheme || 'royal_blue_torn_paper',
        width,
        height,
        time
      );
    } else {
      // Draw image / video scene
      if (inTransition && nextScene) {
        if (activeScene.transition === 'dissolve_black') {
          // Fade to black then fade in next
          const half = 0.5;
          if (transitionProgress < half) {
            drawSceneImage(activeScene, sceneProgress, 1 - (transitionProgress / half));
          } else {
            drawSceneImage(nextScene, 0, (transitionProgress - half) / half);
          }
        } else if (activeScene.transition === 'wipe_right') {
          drawSceneImage(activeScene, sceneProgress, 1.0);
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, 0, width * transitionProgress, height);
          ctx.clip();
          drawSceneImage(nextScene, 0, 1.0);
          ctx.restore();
        } else {
          // Standard crossfade
          drawSceneImage(activeScene, sceneProgress, 1.0);
          drawSceneImage(nextScene, 0, transitionProgress);
        }
      } else {
        drawSceneImage(activeScene, sceneProgress, 1.0);
      }
    }

    // Vignette
    const vignette = ctx.createRadialGradient(
      width / 2, height / 2, Math.min(width, height) * 0.4,
      width / 2, height / 2, Math.max(width, height) * 0.75
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, `rgba(0,0,0,${stylePreset?.vignette ?? 0.5})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // Cinematic 2.39:1 Letterbox Bars
    if (stylePreset?.letterbox) {
      const barHeight = Math.round(height * 0.1);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, barHeight);
      ctx.fillRect(0, height - barHeight, width, barHeight);
    }

    // SPECIFIC LYRIC ENGINE LAYOUT MODES
    if (showOverlays && config.subtitlesEnabled) {
      if (stylePreset?.lyricLayoutMode === 'wondernitz_block') {
        renderWondernitzBlock({
          ctx,
          width,
          height,
          text: activeScene.subtitle || activeScene.scriptBeat || 'I NO FIT\nEVER\nSTAND FOR\nLINE',
          songMetadata: config.songMetadata,
          progress: sceneProgress,
          stylePreset,
          isPortrait,
          time,
          artistImage: artistImageRef.current
        });
        return; // Wondernitz fills the complete poster canvas
      } else if (stylePreset?.lyricLayoutMode === 'artist_spotlight') {
        renderArtistSpotlight({
          ctx,
          width,
          height,
          text: activeScene.subtitle || activeScene.scriptBeat || 'MIXING & MASTERING',
          songMetadata: config.songMetadata,
          progress: sceneProgress,
          stylePreset,
          isPortrait,
          time,
          artistImage: artistImageRef.current
        });
        return; // Artist spotlight fills the complete poster canvas
      } else if (stylePreset?.lyricLayoutMode === 'perspective_3d') {
        renderPerspective3D({
          ctx,
          width,
          height,
          text: activeScene.subtitle || activeScene.scriptBeat || 'SPEEDING DOWN THE GLOWING HIGHWAY',
          songMetadata: config.songMetadata,
          progress: sceneProgress,
          stylePreset,
          isPortrait,
          time,
        });
        return;
      }

      // Standard / kinetic overlay subtitles
      if (activeScene.subtitle) {
        ctx.save();
        const fontFamily = captionConfig?.fontFamily || 'Montserrat';
        const fontSize = isPortrait ? Math.round(width * 0.045) : Math.round(width * 0.025);
        const fontWeight = captionConfig?.fontWeight || 800;
        ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", -apple-system, sans-serif`;
        ctx.textAlign = 'center';

        const yPos = isPortrait 
          ? height * (captionConfig?.positionY || 0.78)
          : height * (captionConfig?.positionY || 0.86);

        const words = activeScene.subtitle.split(' ');
        const totalWords = words.length;
        const activeWordIndex = Math.min(totalWords - 1, Math.floor(sceneProgress * totalWords));

        // Calculate total text width for background pill
        const fullText = captionConfig?.textTransform === 'uppercase' 
          ? activeScene.subtitle.toUpperCase() 
          : activeScene.subtitle;

        const metrics = ctx.measureText(fullText);
        const pillWidth = Math.min(width * 0.92, metrics.width + 48);
        const pillHeight = fontSize * 1.9;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.roundRect((width - pillWidth) / 2, yPos - pillHeight / 1.4, pillWidth, pillHeight, 16);
        ctx.fill();

        // Draw words with kinetic highlight on current word
        const startX = width / 2 - metrics.width / 2;
        let curX = startX;

        words.forEach((word, wIdx) => {
          const isCurrent = wIdx === activeWordIndex;
          const displayWord = captionConfig?.textTransform === 'uppercase' ? word.toUpperCase() : word;
          
          ctx.fillStyle = isCurrent 
            ? (captionConfig?.highlightColor || '#fbbf24') 
            : (captionConfig?.textColor || '#ffffff');

          ctx.shadowColor = 'rgba(0,0,0,0.9)';
          ctx.shadowBlur = isCurrent ? 10 : 5;

          ctx.textAlign = 'left';
          ctx.fillText(displayWord, curX, yPos);

          const wordMetric = ctx.measureText(displayWord + ' ');
          curX += wordMetric.width;
        });

        ctx.restore();
      }
    }

    // Lower Third / Scene Tag Overlay
    if (showOverlays && activeScene.lowerThird) {
      ctx.save();
      const lt = activeScene.lowerThird;
      const x = isPortrait ? 36 : 48;
      const y = isPortrait ? 50 : 50;

      // Semi-transparent tag
      ctx.fillStyle = 'rgba(10, 12, 16, 0.75)';
      ctx.beginPath();
      ctx.roundRect(x, y, isPortrait ? 260 : 320, 52, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Red recording pill indicator
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(x + 20, y + 26, 5, 0, Math.PI * 2);
      ctx.fill();

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(lt.title, x + 36, y + 22);

      // Subtitle / timecode
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '10px monospace';
      ctx.fillText(`${lt.subtitle} • ${activeScene.cameraMotion.toUpperCase()}`, x + 36, y + 38);

      ctx.restore();
    }
  }, [scenes, visuals, config, isPlaying, isMuted, showOverlays]);

  // Pass canvas element to parent ref for video recording export
  useEffect(() => {
    if (canvasRefOut && canvasRef.current) {
      (canvasRefOut as any).current = canvasRef.current;
    }
  });

  // Main playback loop
  useEffect(() => {
    let animId: number;

    const loop = (timestamp: number) => {
      if (!lastTimestampRef.current) {
        lastTimestampRef.current = timestamp;
      }
      const delta = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      if (isPlaying) {
        let nextTime = currentTime + delta;
        if (nextTime >= totalDuration) {
          nextTime = 0; // loop or pause at end
        }
        onTimeUpdate(nextTime);
        renderFrame(nextTime);
      } else {
        renderFrame(currentTime);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    animFrameIdRef.current = animId;

    return () => {
      cancelAnimationFrame(animId);
      lastTimestampRef.current = null;
    };
  }, [isPlaying, currentTime, totalDuration, onTimeUpdate, renderFrame]);

  // Jump to specific scene
  const jumpToScene = (sceneId: string) => {
    const target = scenes.find(s => s.id === sceneId);
    if (target) {
      onTimeUpdate(target.startTime);
      onSelectScene(target.id);
      renderFrame(target.startTime);
    }
  };

  const handlePrevScene = () => {
    const state = getTimelineState(scenes, currentTime);
    if (state.activeSceneIndex > 0) {
      const prev = scenes[state.activeSceneIndex - 1];
      onTimeUpdate(prev.startTime);
      onSelectScene(prev.id);
    } else {
      onTimeUpdate(0);
    }
  };

  const handleNextScene = () => {
    const state = getTimelineState(scenes, currentTime);
    if (state.activeSceneIndex < scenes.length - 1) {
      const next = scenes[state.activeSceneIndex + 1];
      onTimeUpdate(next.startTime);
      onSelectScene(next.id);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const isPortrait = config.aspectRatio === '9:16';

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col h-full bg-zinc-950 select-none overflow-hidden ${
        isFullscreen ? 'p-4 justify-center items-center' : ''
      }`}
    >
      {/* Canvas Screen Viewport */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center p-3 overflow-hidden bg-radial from-zinc-900/60 to-zinc-950">
        <div 
          className={`relative rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 bg-black transition-all ${
            isPortrait 
              ? 'h-full aspect-[9/16] max-w-[420px]' 
              : 'w-full aspect-video max-h-full max-w-4xl'
          }`}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain block"
          />

          {/* Quick HUD badge in player corner */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-black/60 backdrop-blur-md text-zinc-300 border border-white/10 rounded-full">
              {config.aspectRatio} • {config.targetDuration}s
            </span>
          </div>

          {/* Play/Pause center overlay click */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute inset-0 w-full h-full opacity-0 hover:opacity-100 transition-opacity bg-black/20 flex items-center justify-center group"
            aria-label={isPlaying ? "Pause Video" : "Play Continuous Video"}
          >
            <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </div>
          </button>
        </div>
      </div>

      {/* Player Control Bar */}
      <div className="border-t border-zinc-800 bg-zinc-900/80 px-4 py-2.5 shrink-0 flex flex-col gap-2">
        {/* Scrubber Progress Bar */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-zinc-300 w-12 text-right">
            {formatTimecode(currentTime)}
          </span>

          <div 
            className="flex-1 relative h-2 bg-zinc-800 hover:h-2.5 rounded-full cursor-pointer transition-all group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              const newTime = pos * totalDuration;
              onTimeUpdate(newTime);
              renderFrame(newTime);
            }}
          >
            {/* Scene Markers */}
            {scenes.map((s) => {
              const leftPercent = (s.startTime / totalDuration) * 100;
              return (
                <div
                  key={s.id}
                  style={{ left: `${leftPercent}%` }}
                  className="absolute top-0 bottom-0 w-0.5 bg-zinc-600/70 z-10"
                  title={`${s.title} (${s.startTime}s)`}
                />
              );
            })}

            {/* Elapsed Bar */}
            <div
              style={{ width: `${(currentTime / totalDuration) * 100}%` }}
              className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 rounded-full relative"
            >
              {/* Playhead Knob */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform" />
            </div>
          </div>

          <span className="text-[11px] font-mono text-zinc-400 w-12">
            {formatTimecode(totalDuration)}
          </span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Rewind */}
            <button
              onClick={() => {
                onTimeUpdate(0);
                renderFrame(0);
              }}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
              title="Rewind to start"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Prev Scene */}
            <button
              onClick={handlePrevScene}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
              title="Previous scene beat"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/40 transition-transform hover:scale-105 active:scale-95"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            {/* Next Scene */}
            <button
              onClick={handleNextScene}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
              title="Next scene beat"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Mute/Audio toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-1.5 rounded-lg transition-colors ${
                isMuted ? 'text-zinc-500 hover:bg-zinc-800' : 'text-zinc-300 hover:bg-zinc-800'
              }`}
              title={isMuted ? 'Unmute Audio & TTS' : 'Mute Audio & TTS'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-zinc-300" />}
            </button>
          </div>

          {/* Current Scene Badge & Right Toggles */}
          <div className="flex items-center gap-3">
            {/* Active Scene indicator */}
            {(() => {
              const active = getTimelineState(scenes, currentTime).activeScene;
              return active ? (
                <div 
                  onClick={() => onSelectScene(active.id)}
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 rounded-lg text-xs cursor-pointer transition-colors"
                  title="Click to inspect this scene beat in timeline"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="font-semibold text-zinc-200">Scene {active.sceneNumber}:</span>
                  <span className="text-zinc-400 truncate max-w-[140px]">{active.title}</span>
                </div>
              ) : null;
            })()}

            {/* Subtitles Overlay Toggle */}
            <button
              onClick={() => setShowOverlays(!showOverlays)}
              className={`p-1.5 rounded-lg transition-colors ${
                showOverlays ? 'text-amber-400 bg-zinc-800' : 'text-zinc-500 hover:bg-zinc-800'
              }`}
              title="Toggle onscreen captions & HUD overlay"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
