import React from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Split, 
  ArrowLeft, 
  ArrowRight, 
  Video, 
  Camera, 
  Sparkles, 
  Maximize2,
  Clock,
  Layers,
  Repeat
} from 'lucide-react';
import { VideoScene, VisualAsset, CameraMotion, TransitionType, AspectRatio } from '../types/index';
import { getTotalDuration, formatTimecode } from '../utils/timelineEngine';

interface TimelineEditorProps {
  scenes: VideoScene[];
  visuals: VisualAsset[];
  selectedSceneId: string | null;
  onSelectScene: (id: string) => void;
  onUpdateScene: (id: string, updated: Partial<VideoScene>) => void;
  onAddScene: () => void;
  onDuplicateScene: (id: string) => void;
  onSplitScene: (id: string) => void;
  onDeleteScene: (id: string) => void;
  onMoveScene: (fromIndex: number, toIndex: number) => void;
  onRescaleToTarget: () => void;
  targetDuration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  aspectRatio: AspectRatio;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({
  scenes,
  visuals,
  selectedSceneId,
  onSelectScene,
  onUpdateScene,
  onAddScene,
  onDuplicateScene,
  onSplitScene,
  onDeleteScene,
  onMoveScene,
  onRescaleToTarget,
  targetDuration,
  currentTime,
  onSeek,
  aspectRatio,
}) => {
  const totalDuration = getTotalDuration(scenes) || targetDuration;
  const selectedScene = scenes.find(s => s.id === selectedSceneId) || scenes[0];
  const selectedIndex = scenes.findIndex(s => s.id === selectedScene?.id);

  const cameraOptions: { value: CameraMotion; label: string }[] = [
    { value: 'zoom_in', label: 'Slow Zoom In (Hero Push)' },
    { value: 'zoom_out', label: 'Dramatic Zoom Out (Reveal)' },
    { value: 'pan_left', label: 'Cinematic Pan Left' },
    { value: 'pan_right', label: 'Cinematic Pan Right' },
    { value: 'tilt_up', label: 'Vertical Tilt Up' },
    { value: 'cinematic_drift', label: 'Subtle Cinematic Drift' },
    { value: 'orbit', label: 'Dynamic Orbit Arc' },
    { value: 'static', label: 'Static Locked Shot' },
  ];

  const transitionOptions: { value: TransitionType; label: string }[] = [
    { value: 'crossfade', label: 'Crossfade Blend' },
    { value: 'dissolve_black', label: 'Dip to Black' },
    { value: 'wipe_right', label: 'Directional Wipe' },
    { value: 'zoom_in', label: 'Zoom Burst Transition' },
    { value: 'cut', label: 'Direct Cut' },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-t border-zinc-800 overflow-hidden">
      {/* Top Bar: Timeline Summary & Controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
            <Layers className="w-4 h-4 text-rose-500" />
            <span>Continuous Timeline ({scenes.length} Scene Beats)</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
            Total: {formatTimecode(totalDuration)} / Target: {targetDuration}s
          </span>
          {Math.abs(totalDuration - targetDuration) > 0.5 && (
            <button
              onClick={onRescaleToTarget}
              className="flex items-center gap-1 text-[11px] font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded transition-colors"
              title="Rescale all scene durations proportionally to equal the target duration exactly"
            >
              <Repeat className="w-3 h-3" />
              <span>Rescale to {targetDuration}s</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddScene}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-rose-400" />
            <span>Add Beat</span>
          </button>
        </div>
      </div>

      {/* Interactive Visual Timeline Track */}
      <div className="px-4 py-3 bg-zinc-950 shrink-0 overflow-x-auto">
        <div className="relative min-w-[700px] h-20 bg-zinc-900/90 rounded-xl border border-zinc-800 p-1.5 flex gap-1 select-none">
          {/* Current Playhead Line */}
          <div
            style={{ left: `${(currentTime / totalDuration) * 100}%` }}
            className="absolute top-0 bottom-0 w-0.5 bg-rose-500 shadow-md shadow-rose-500/50 z-20 pointer-events-none transition-all duration-75"
          >
            <div className="w-2 h-2 -ml-[3px] bg-rose-500 rotate-45" />
          </div>

          {scenes.map((scene, idx) => {
            const isSelected = scene.id === selectedScene?.id;
            const asset = visuals.find(v => v.id === scene.assignedAssetId);
            const widthPercent = (scene.duration / totalDuration) * 100;

            return (
              <div
                key={scene.id}
                style={{ width: `${widthPercent}%` }}
                onClick={() => {
                  onSelectScene(scene.id);
                  onSeek(scene.startTime);
                }}
                className={`relative h-full rounded-lg border overflow-hidden cursor-pointer transition-all flex flex-col justify-between p-1.5 ${
                  isSelected
                    ? 'border-rose-500 ring-2 ring-rose-500/40 bg-zinc-800/90 shadow-lg'
                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800/60'
                }`}
                title={`Scene ${scene.sceneNumber}: ${scene.title} (${scene.duration}s)`}
              >
                {/* Background visual asset faint preview */}
                {asset && (
                  <img
                    src={asset.url}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
                  />
                )}

                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[10px] font-bold px-1 py-0.2 bg-black/60 rounded text-zinc-200">
                    #{scene.sceneNumber}
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-zinc-300 bg-black/60 px-1 py-0.2 rounded">
                    {scene.duration}s
                  </span>
                </div>

                <div className="relative z-10 truncate text-[11px] font-medium text-zinc-200">
                  {scene.title}
                </div>

                <div className="relative z-10 flex items-center gap-1 text-[9px] text-zinc-400 truncate">
                  <span>{scene.cameraMotion.replace('_', ' ')}</span>
                  <span>•</span>
                  <span>{scene.transition}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Scene Inspector & Directorial Editor */}
      {selectedScene && (
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 bg-zinc-900/30 border-t border-zinc-800/80">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl">
            {/* Column 1: Scene Identity & Visual Asset Assignment */}
            <div className="space-y-3 bg-zinc-900/70 border border-zinc-800 p-3.5 rounded-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-rose-600 text-white text-xs font-bold flex items-center justify-center">
                    {selectedScene.sceneNumber}
                  </span>
                  <input
                    type="text"
                    value={selectedScene.title}
                    onChange={(e) => onUpdateScene(selectedScene.id, { title: e.target.value })}
                    className="bg-transparent font-semibold text-xs text-zinc-100 border-b border-transparent hover:border-zinc-600 focus:border-rose-500 focus:outline-none px-1"
                  />
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                  <Clock className="w-3 h-3 text-zinc-400" />
                  <span>{formatTimecode(selectedScene.startTime)}</span>
                </div>
              </div>

              {/* Duration Adjustment */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label className="text-zinc-400">Beat Duration</label>
                  <span className="font-mono text-zinc-200 font-bold">{selectedScene.duration}s</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={0.5}
                    value={selectedScene.duration}
                    onChange={(e) => onUpdateScene(selectedScene.id, { duration: parseFloat(e.target.value) })}
                    className="flex-1 accent-rose-500 cursor-pointer"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateScene(selectedScene.id, { duration: Math.max(1, selectedScene.duration - 0.5) })}
                      className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded"
                    >
                      -
                    </button>
                    <button
                      onClick={() => onUpdateScene(selectedScene.id, { duration: selectedScene.duration + 0.5 })}
                      className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Assigned Visual Asset Reference */}
              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1.5">
                  Visual Reference Picture
                </label>
                <div className="flex items-center gap-3">
                  {/* Thumbnail */}
                  <div className="w-16 h-12 bg-zinc-950 rounded-lg border border-zinc-700 overflow-hidden shrink-0 flex items-center justify-center">
                    {(() => {
                      const asset = visuals.find(v => v.id === selectedScene.assignedAssetId);
                      return asset ? (
                        <img src={asset.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-zinc-500">No Asset</span>
                      );
                    })()}
                  </div>

                  {/* Dropdown selector */}
                  <select
                    value={selectedScene.assignedAssetId || ''}
                    onChange={(e) => onUpdateScene(selectedScene.id, { assignedAssetId: e.target.value || undefined })}
                    className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-rose-500 truncate"
                  >
                    <option value="">-- No reference image --</option>
                    {visuals.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.aspectRatio})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Scene Reorder and Quick Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => selectedIndex > 0 && onMoveScene(selectedIndex, selectedIndex - 1)}
                    disabled={selectedIndex === 0}
                    className="p-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded text-zinc-300"
                    title="Move Scene Left"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => selectedIndex < scenes.length - 1 && onMoveScene(selectedIndex, selectedIndex + 1)}
                    disabled={selectedIndex === scenes.length - 1}
                    className="p-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded text-zinc-300"
                    title="Move Scene Right"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onDuplicateScene(selectedScene.id)}
                    className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded"
                    title="Duplicate Beat"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onSplitScene(selectedScene.id)}
                    className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded"
                    title="Split Beat into Two"
                  >
                    <Split className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteScene(selectedScene.id)}
                    disabled={scenes.length <= 1}
                    className="p-1.5 bg-rose-600/30 hover:bg-rose-600 disabled:opacity-30 text-rose-300 hover:text-white rounded"
                    title="Delete Beat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Column 2: Script Beat & Narration */}
            <div className="space-y-3 bg-zinc-900/70 border border-zinc-800 p-3.5 rounded-xl">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Voiceover & Narration Beat
                </label>
                <textarea
                  value={selectedScene.scriptBeat}
                  onChange={(e) => {
                    const text = e.target.value;
                    onUpdateScene(selectedScene.id, { 
                      scriptBeat: text,
                      subtitle: text.length > 90 ? text.slice(0, 87) + '...' : text
                    });
                  }}
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-rose-500 rounded-lg p-2 text-xs text-zinc-200 leading-relaxed focus:outline-none resize-none font-sans"
                  placeholder="Spoken narration for this beat..."
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">
                  On-Screen Caption / Subtitle
                </label>
                <input
                  type="text"
                  value={selectedScene.subtitle}
                  onChange={(e) => onUpdateScene(selectedScene.id, { subtitle: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-rose-500 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none"
                  placeholder="Subtitle text..."
                />
              </div>

              {/* Lower Third Badge */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase">Lower-Third Title</label>
                  <input
                    type="text"
                    value={selectedScene.lowerThird?.title || ''}
                    onChange={(e) => onUpdateScene(selectedScene.id, { 
                      lowerThird: { 
                        title: e.target.value, 
                        subtitle: selectedScene.lowerThird?.subtitle || '' 
                      } 
                    })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none"
                    placeholder="SCENE TITLE"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase">Lower-Third Tag</label>
                  <input
                    type="text"
                    value={selectedScene.lowerThird?.subtitle || ''}
                    onChange={(e) => onUpdateScene(selectedScene.id, { 
                      lowerThird: { 
                        title: selectedScene.lowerThird?.title || '', 
                        subtitle: e.target.value 
                      } 
                    })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none"
                    placeholder="LOCATION / CUE"
                  />
                </div>
              </div>
            </div>

            {/* Column 3: AI Video Prompt & Camera Choreography */}
            <div className="space-y-3 bg-zinc-900/70 border border-zinc-800 p-3.5 rounded-xl">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>AI Video Generation Prompt</span>
                  </label>
                </div>
                <textarea
                  value={selectedScene.visualPrompt}
                  onChange={(e) => onUpdateScene(selectedScene.id, { visualPrompt: e.target.value })}
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-500 rounded-lg p-2 text-xs text-zinc-200 leading-relaxed focus:outline-none resize-none font-mono"
                  placeholder="Cinematic video prompt describing subject, lighting, environment, and camera..."
                />
              </div>

              {/* Camera Motion & Transition Presets */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">
                    Camera Motion
                  </label>
                  <select
                    value={selectedScene.cameraMotion}
                    onChange={(e) => onUpdateScene(selectedScene.id, { cameraMotion: e.target.value as CameraMotion })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-200 focus:outline-none"
                  >
                    {cameraOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">
                    Scene Transition
                  </label>
                  <select
                    value={selectedScene.transition}
                    onChange={(e) => onUpdateScene(selectedScene.id, { transition: e.target.value as TransitionType })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-200 focus:outline-none"
                  >
                    {transitionOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
