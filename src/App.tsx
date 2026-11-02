/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { AssetHub } from './components/AssetHub';
import { ContinuousVideoPlayer } from './components/ContinuousVideoPlayer';
import { TimelineEditor } from './components/TimelineEditor';
import { ExportModal } from './components/ExportModal';
import { SAMPLE_PROJECTS, SampleProject } from './data/sampleProjects';
import { 
  ProjectConfig, 
  VisualAsset, 
  ScriptDocument, 
  VideoScene, 
  AspectRatio 
} from './types/index';
import { 
  computeSceneTimings, 
  rescaleTimeline, 
  reorderScenes, 
  getTotalDuration 
} from './utils/timelineEngine';
import { generateHeuristicScenes } from './utils/scriptParser';

export default function App() {
  // Load initial demo project (Horizon Apex 30s Landscape)
  const initialSample = SAMPLE_PROJECTS[0];

  const [config, setConfig] = useState<ProjectConfig>(initialSample.config);
  const [visuals, setVisuals] = useState<VisualAsset[]>(initialSample.visuals);
  const [documents, setDocuments] = useState<ScriptDocument[]>(initialSample.documents);
  const [scriptText, setScriptText] = useState<string>(initialSample.documents[0]?.content || '');
  const [scenes, setScenes] = useState<VideoScene[]>(initialSample.scenes);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(initialSample.scenes[0]?.id || null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isSequencing, setIsSequencing] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Split-pane width / layout
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(360);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute set of visual asset IDs assigned to at least one scene
  const assignedAssetIds = useMemo(() => {
    const ids = new Set<string>();
    scenes.forEach(s => {
      if (s.assignedAssetId) ids.add(s.assignedAssetId);
    });
    return ids;
  }, [scenes]);

  // Load sample project preset
  const handleLoadSample = (sample: SampleProject) => {
    setConfig(sample.config);
    setVisuals(sample.visuals);
    setDocuments(sample.documents);
    setScriptText(sample.documents[0]?.content || '');
    const timed = computeSceneTimings(sample.scenes);
    setScenes(timed);
    setSelectedSceneId(timed[0]?.id || null);
    setCurrentTime(0);
  };

  // Update Config & auto-rescale if targetDuration changed
  const handleUpdateConfig = (updated: Partial<ProjectConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...updated };
      if (updated.targetDuration && updated.targetDuration !== prev.targetDuration && scenes.length > 0) {
        setScenes(rescaleTimeline(scenes, updated.targetDuration));
      }
      return next;
    });
  };

  // Run AI Sequencing Engine (calls backend or heuristic fallback)
  const handleRunSequencing = async () => {
    setIsSequencing(true);
    try {
      const response = await fetch('/api/analyze-and-sequence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptText,
          documents,
          visuals: visuals.map(v => ({ id: v.id, name: v.name, tags: v.tags, aspectRatio: v.aspectRatio })),
          targetDuration: config.targetDuration,
          aspectRatio: config.aspectRatio,
          directorInstructions: config.directorInstructions,
          style: config.style,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data && data.scenes && data.scenes.length > 0) {
        const timed = computeSceneTimings(data.scenes);
        setScenes(timed);
        setSelectedSceneId(timed[0]?.id || null);
        setCurrentTime(0);
      } else {
        throw new Error('Invalid scene sequence returned');
      }
    } catch (err: any) {
      console.warn('API sequencing fallback triggered:', err.message);
      // Fallback locally
      const generated = generateHeuristicScenes(
        scriptText, 
        visuals, 
        config.targetDuration, 
        config.directorInstructions
      );
      const rescaled = rescaleTimeline(generated, config.targetDuration);
      setScenes(rescaled);
      setSelectedSceneId(rescaled[0]?.id || null);
      setCurrentTime(0);
    } finally {
      setIsSequencing(false);
    }
  };

  // Asset Handlers
  const handleAddVisuals = (newVisuals: VisualAsset[]) => {
    setVisuals(prev => [...newVisuals, ...prev]);
  };

  const handleRemoveVisual = (id: string) => {
    setVisuals(prev => prev.filter(v => v.id !== id));
    // Clear assignment in scenes if used
    setScenes(prev => prev.map(s => s.assignedAssetId === id ? { ...s, assignedAssetId: undefined } : s));
  };

  const handleAddDocuments = (newDocs: ScriptDocument[]) => {
    setDocuments(prev => [...newDocs, ...prev]);
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  // Scene Operations
  const handleUpdateScene = (id: string, updated: Partial<VideoScene>) => {
    setScenes(prev => {
      const modified = prev.map(s => s.id === id ? { ...s, ...updated } : s);
      return computeSceneTimings(modified);
    });
  };

  const handleAddScene = () => {
    const defaultDuration = 5;
    const newScene: VideoScene = {
      id: `scene-${Date.now().toString(36)}`,
      sceneNumber: scenes.length + 1,
      title: `Beat ${scenes.length + 1}`,
      duration: defaultDuration,
      startTime: getTotalDuration(scenes),
      assignedAssetId: visuals[scenes.length % visuals.length]?.id,
      scriptBeat: 'New narrative beat continuing the continuous sequence.',
      visualPrompt: `Cinematic capture for beat ${scenes.length + 1}, dynamic motion, high definition.`,
      cameraMotion: 'zoom_in',
      transition: 'crossfade',
      transitionDuration: 0.8,
      subtitle: 'New narrative beat continuing the continuous sequence.',
    };
    const updated = [...scenes, newScene];
    setScenes(rescaleTimeline(updated, config.targetDuration));
    setSelectedSceneId(newScene.id);
  };

  const handleDuplicateScene = (id: string) => {
    const target = scenes.find(s => s.id === id);
    if (!target) return;
    const targetIdx = scenes.findIndex(s => s.id === id);
    const duplicated: VideoScene = {
      ...target,
      id: `scene-${Date.now().toString(36)}`,
      title: `${target.title} (Copy)`,
      duration: Number((target.duration * 0.5).toFixed(1)),
    };
    const halfOriginal = {
      ...target,
      duration: Number((target.duration * 0.5).toFixed(1)),
    };
    const copy = [...scenes];
    copy.splice(targetIdx, 1, halfOriginal, duplicated);
    const timed = computeSceneTimings(copy);
    setScenes(timed);
    setSelectedSceneId(duplicated.id);
  };

  const handleSplitScene = (id: string) => {
    const target = scenes.find(s => s.id === id);
    if (!target) return;
    const targetIdx = scenes.findIndex(s => s.id === id);
    const halfDuration = Number((target.duration / 2).toFixed(1));

    const part1: VideoScene = {
      ...target,
      duration: halfDuration,
      title: `${target.title} Pt. 1`,
    };

    const part2: VideoScene = {
      ...target,
      id: `scene-split-${Date.now().toString(36)}`,
      duration: halfDuration,
      title: `${target.title} Pt. 2`,
      cameraMotion: target.cameraMotion === 'zoom_in' ? 'pan_left' : 'zoom_in',
    };

    const copy = [...scenes];
    copy.splice(targetIdx, 1, part1, part2);
    setScenes(computeSceneTimings(copy));
    setSelectedSceneId(part2.id);
  };

  const handleDeleteScene = (id: string) => {
    if (scenes.length <= 1) return;
    const filtered = scenes.filter(s => s.id !== id);
    const rescaled = rescaleTimeline(filtered, config.targetDuration);
    setScenes(rescaled);
    if (selectedSceneId === id) {
      setSelectedSceneId(rescaled[0]?.id || null);
    }
  };

  const handleMoveScene = (fromIndex: number, toIndex: number) => {
    setScenes(reorderScenes(scenes, fromIndex, toIndex));
  };

  const handleRescaleToTarget = () => {
    setScenes(rescaleTimeline(scenes, config.targetDuration));
  };

  // Keyboard shortcut for Play/Pause (Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea', 'select'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        // Playhead toggle handled in ContinuousVideoPlayer
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans select-none">
      {/* Top Header */}
      <Header
        config={config}
        onUpdateConfig={handleUpdateConfig}
        onLoadSample={handleLoadSample}
        onOpenExport={() => setIsExportModalOpen(true)}
        onExportSpec={() => setIsExportModalOpen(true)}
        sceneCount={scenes.length}
        totalDuration={getTotalDuration(scenes)}
      />

      {/* Main Studio Work Area */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left Side: Asset Hub & Ingestion (ZIP, Folders, PDF, MD, Images, Director's Brief) */}
        <div 
          style={{ width: `${leftPanelWidth}px` }} 
          className="shrink-0 h-full overflow-hidden hidden md:block"
        >
          <AssetHub
            visuals={visuals}
            documents={documents}
            config={config}
            scriptText={scriptText}
            onUpdateScriptText={setScriptText}
            onUpdateConfig={handleUpdateConfig}
            onAddVisuals={handleAddVisuals}
            onRemoveVisual={handleRemoveVisual}
            onAddDocuments={handleAddDocuments}
            onRemoveDocument={handleRemoveDocument}
            onRunSequencing={handleRunSequencing}
            isSequencing={isSequencing}
            assignedAssetIds={assignedAssetIds}
          />
        </div>

        {/* Center & Bottom: Video Player & Timeline Editor */}
        <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
          {/* Top Half: Continuous Video Canvas Preview Player */}
          <div className="h-[55%] min-h-0 w-full overflow-hidden">
            <ContinuousVideoPlayer
              scenes={scenes}
              visuals={visuals}
              config={config}
              currentTime={currentTime}
              onTimeUpdate={setCurrentTime}
              onSelectScene={setSelectedSceneId}
              selectedSceneId={selectedSceneId}
              canvasRefOut={canvasRef}
            />
          </div>

          {/* Bottom Half: Multi-track Timeline & Scene Inspector */}
          <div className="h-[45%] min-h-0 w-full overflow-hidden">
            <TimelineEditor
              scenes={scenes}
              visuals={visuals}
              selectedSceneId={selectedSceneId}
              onSelectScene={setSelectedSceneId}
              onUpdateScene={handleUpdateScene}
              onAddScene={handleAddScene}
              onDuplicateScene={handleDuplicateScene}
              onSplitScene={handleSplitScene}
              onDeleteScene={handleDeleteScene}
              onMoveScene={handleMoveScene}
              onRescaleToTarget={handleRescaleToTarget}
              targetDuration={config.targetDuration}
              currentTime={currentTime}
              onSeek={setCurrentTime}
              aspectRatio={config.aspectRatio}
            />
          </div>
        </div>
      </div>

      {/* Export & Render Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        scenes={scenes}
        visuals={visuals}
        config={config}
        canvasRef={canvasRef}
      />
    </div>
  );
}
