import { VideoScene, VisualAsset, ProjectConfig } from '../types/index';
import { StylePreset, CaptionConfig } from '../types/styles';
import { getTotalDuration } from './timelineEngine';

export interface RemotionProjectBundle {
  'Root.tsx': string;
  'Composition.tsx': string;
  'Subtitles.tsx': string;
  'remotion.config.ts': string;
  'package.json': string;
  'composition-props.json': string;
  'hyperframe.config.json': string;
}

/**
 * Generates full Remotion React code files and Hyperframe configuration.
 */
export function generateRemotionProjectBundle(
  scenes: VideoScene[],
  visuals: VisualAsset[],
  config: ProjectConfig,
  style: StylePreset,
  captionConfig: CaptionConfig,
  fps: number = 30
): RemotionProjectBundle {
  const isPortrait = config.aspectRatio === '9:16';
  const width = isPortrait ? 1080 : 1920;
  const height = isPortrait ? 1920 : 1080;
  const totalDuration = getTotalDuration(scenes) || config.targetDuration;
  const durationInFrames = Math.round(totalDuration * fps);

  // Serialized Props
  const compositionProps = {
    title: config.title,
    aspectRatio: config.aspectRatio,
    fps,
    totalDuration,
    stylePreset: style,
    captionConfig,
    scenes: scenes.map(s => ({
      ...s,
      durationInFrames: Math.round(s.duration * fps),
      asset: visuals.find(v => v.id === s.assignedAssetId) || null,
    })),
  };

  const rootTsx = `import React from 'react';
import { Composition } from 'remotion';
import { MainComposition } from './Composition';
import propsData from './composition-props.json';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MainVideo"
        component={MainComposition}
        durationInFrames={${durationInFrames}}
        fps={${fps}}
        width={${width}}
        height={${height}}
        defaultProps={propsData}
      />
    </>
  );
};
`;

  const compositionTsx = `import React from 'react';
import {
  Sequence,
  Series,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
  Audio,
} from 'remotion';
import { SubtitlesTrack } from './Subtitles';

export const MainComposition: React.FC<any> = ({ scenes, stylePreset, captionConfig }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  return (
    <div style={{ flex: 1, backgroundColor: '#000', position: 'relative', overflow: 'hidden' }}>
      <Series>
        {scenes.map((scene: any, i: number) => {
          return (
            <Series.Sequence key={scene.id} durationInFrames={scene.durationInFrames}>
              <SceneClip scene={scene} stylePreset={stylePreset} fps={fps} />
            </Series.Sequence>
          );
        })}
      </Series>

      {/* Subtitles Overlay */}
      <SubtitlesTrack scenes={scenes} captionConfig={captionConfig} fps={fps} />

      {/* Cinematic Letterbox if enabled */}
      {stylePreset.letterbox && (
        <>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.1, backgroundColor: '#000', zIndex: 40 }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.1, backgroundColor: '#000', zIndex: 40 }} />
        </>
      )}
    </div>
  );
};

const SceneClip: React.FC<any> = ({ scene, stylePreset, fps }) => {
  const frame = useCurrentFrame();

  const spr = spring({
    frame,
    fps,
    config: {
      damping: stylePreset.springDamping || 20,
      mass: stylePreset.springMass || 1,
      stiffness: stylePreset.springStiffness || 100,
    },
  });

  const scale = interpolate(spr, [0, 1], [1.0, 1.15]);
  const opacity = interpolate(frame, [0, Math.min(15, scene.durationInFrames * 0.2)], [0, 1]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', opacity }}>
      {scene.asset?.url ? (
        <Img
          src={scene.asset.url}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: \`scale(\${scale})\`,
            filter: \`contrast(1.08) brightness(1.02) saturate(\${stylePreset.category === 'cyberpunk' ? 1.4 : 1.05})\`,
          }}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#181b24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ color: '#fff', fontSize: 48, fontFamily: stylePreset.fontFamily }}>{scene.title}</h2>
        </div>
      )}
    </div>
  );
};
`;

  const subtitlesTsx = `import React from 'react';
import { useCurrentFrame } from 'remotion';

export const SubtitlesTrack: React.FC<any> = ({ scenes, captionConfig, stylePreset, songMetadata, fps }) => {
  const frame = useCurrentFrame();
  const currentTime = frame / fps;

  let activeScene = scenes[0];
  let accumulated = 0;

  for (const scene of scenes) {
    const sceneDur = scene.durationInFrames / fps;
    if (currentTime >= accumulated && currentTime < accumulated + sceneDur) {
      activeScene = scene;
      break;
    }
    accumulated += sceneDur;
  }

  if (!activeScene || !activeScene.subtitle) return null;

  // Wondernitz Auto-Block Stack (User Poster 1)
  if (stylePreset?.lyricLayoutMode === 'wondernitz_block') {
    const lines = activeScene.subtitle.split('\\n');
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '40px 24px',
          boxSizing: 'border-box',
          zIndex: 50,
          pointerEvents: 'none',
        }}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '85%' }}>
          {lines.map((line: string, i: number) => {
            const isShort = line.length <= 5;
            const fSize = isShort ? 120 : line.length <= 10 ? 76 : 48;
            return (
              <div
                key={i}
                style={{
                  width: '100%',
                  textAlign: 'center',
                  fontFamily: 'Bebas Neue, Impact, sans-serif',
                  fontSize: fSize,
                  fontWeight: 900,
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  lineHeight: 0.95,
                  letterSpacing: isShort ? '4px' : '2px',
                  textShadow: '0 4px 14px rgba(0,20,80,0.6)',
                }}
              >
                {line}
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: 'center', paddingBottom: 20 }}>
          <div style={{ fontSize: 44, fontWeight: 900, color: '#1b63ff', textShadow: '0 0 20px rgba(56,128,255,0.8), 0 4px 10px rgba(0,0,0,0.8)' }}>
            {(songMetadata?.trackTitle || 'ITALAWA').toUpperCase()}
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0a3cd6', letterSpacing: 6, marginTop: 4 }}>
            {(songMetadata?.artistName || 'RABOSKI').toUpperCase()} • {songMetadata?.songwriters ? ('WRITERS: ' + songMetadata.songwriters.toUpperCase()) : songMetadata?.releaseDate ? ('RELEASE: ' + songMetadata.releaseDate) : 'OFFICIAL LYRIC VIDEO'}
          </div>
        </div>
      </div>
    );
  }

  const words = activeScene.subtitle.split(' ');
  const sceneProgress = Math.min(1, Math.max(0, (currentTime - (activeScene.startTime || 0)) / (activeScene.duration || 5)));
  const activeWordIdx = Math.floor(sceneProgress * words.length);

  return (
    <div
      style={{
        position: 'absolute',
        top: \`\${(captionConfig.positionY || 0.8) * 100}%\`,
        left: '5%',
        right: '5%',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <div
        style={{
          padding: '12px 28px',
          borderRadius: 20,
          backgroundColor: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          justifyContent: 'center',
        }}
      >
        {words.map((w: string, idx: number) => {
          const isCurrent = idx === activeWordIdx;
          return (
            <span
              key={idx}
              style={{
                fontFamily: captionConfig.fontFamily || 'Montserrat',
                fontSize: captionConfig.fontSize || 36,
                fontWeight: captionConfig.fontWeight || 800,
                color: isCurrent ? (captionConfig.highlightColor || '#fbbf24') : (captionConfig.textColor || '#ffffff'),
                textTransform: captionConfig.textTransform || 'uppercase',
                textShadow: '0 4px 12px rgba(0,0,0,0.9)',
                transform: isCurrent ? 'scale(1.12)' : 'scale(1.0)',
                transition: 'all 0.1s ease-out',
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
`;

  const remotionConfigTs = `import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
`;

  const packageJson = JSON.stringify({
    name: 'directorflow-remotion-bundle',
    version: '1.0.0',
    private: true,
    scripts: {
      build: 'remotion bundle',
      render: 'remotion render MainVideo out/final_video.mp4 --props=composition-props.json',
      preview: 'remotion preview',
    },
    dependencies: {
      remotion: '^4.0.0',
      react: '^18.2.0',
      'react-dom': '^18.2.0',
    },
    devDependencies: {
      '@remotion/cli': '^4.0.0',
      typescript: '^5.0.0',
      '@types/react': '^18.2.0',
    },
  }, null, 2);

  const hyperframeConfigJson = JSON.stringify({
    hyperframeVersion: '2.0',
    project: {
      id: `hyp-${Date.now()}`,
      name: config.title,
      aspectRatio: config.aspectRatio,
      dimensions: { width, height },
      fps,
      totalDuration,
    },
    stylePreset: {
      id: style.id,
      category: style.category,
      lutFilter: style.lutFilter,
      motionBias: style.cameraMotionBias,
    },
    tracks: [
      {
        id: 'track-visuals',
        type: 'video_clip_sequence',
        clips: scenes.map(s => ({
          sceneId: s.id,
          title: s.title,
          startTime: s.startTime,
          duration: s.duration,
          transition: s.transition,
          motion: s.cameraMotion,
          visualPrompt: s.visualPrompt,
          assetRef: s.assignedAssetId || null,
        })),
      },
      {
        id: 'track-subtitles',
        type: 'kinetic_captions',
        style: captionConfig,
        cues: scenes.map(s => ({
          startTime: s.startTime,
          duration: s.duration,
          text: s.subtitle,
        })),
      },
      {
        id: 'track-audio-bed',
        type: 'audio_mix',
        enabled: config.bgMusicEnabled,
        mood: config.musicMood,
      },
    ],
    rendererOptions: {
      motionInterpolation: 'spring_physics',
      hardwareAcceleration: 'prefer_cuda_or_metal',
      outputFormat: 'mp4',
    },
  }, null, 2);

  return {
    'Root.tsx': rootTsx,
    'Composition.tsx': compositionTsx,
    'Subtitles.tsx': subtitlesTsx,
    'remotion.config.ts': remotionConfigTs,
    'package.json': packageJson,
    'composition-props.json': JSON.stringify(compositionProps, null, 2),
    'hyperframe.config.json': hyperframeConfigJson,
  };
}

/**
 * Dispatches a render payload to a Remotion Server or Hyperframe endpoint.
 */
export async function dispatchToRemoteRenderer(
  endpointUrl: string,
  pipelineType: 'remotion' | 'hyperframe',
  payload: any,
  authToken?: string
): Promise<{ success: boolean; jobId: string; statusUrl?: string; message: string }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const res = await fetch(endpointUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        pipeline: pipelineType,
        timestamp: new Date().toISOString(),
        payload,
      }),
    });

    if (!res.ok) {
      throw new Error(`Renderer returned HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      success: true,
      jobId: data.jobId || data.id || `job-${Date.now()}`,
      statusUrl: data.statusUrl || data.url,
      message: data.message || `Render task dispatched to ${pipelineType} worker.`,
    };
  } catch (err: any) {
    return {
      success: false,
      jobId: '',
      message: `Failed to dispatch to ${pipelineType} endpoint: ${err.message}`,
    };
  }
}
