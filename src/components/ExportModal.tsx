import React, { useState, useRef } from 'react';
import { 
  X, 
  Download, 
  Film, 
  FileText, 
  Check, 
  Copy, 
  Sparkles, 
  AlertCircle,
  Video
} from 'lucide-react';
import { VideoScene, VisualAsset, ProjectConfig } from '../types/index';
import { getTotalDuration, getTimelineState, formatTimecode } from '../utils/timelineEngine';
import { audioSynth } from '../utils/audioSynthesizer';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenes: VideoScene[];
  visuals: VisualAsset[];
  config: ProjectConfig;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  scenes,
  visuals,
  config,
  canvasRef,
}) => {
  const [exportType, setExportType] = useState<'video' | 'spec'>('video');
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [copiedSpec, setCopiedSpec] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const totalDuration = getTotalDuration(scenes) || config.targetDuration;

  // Render & Record Continuous Video via MediaRecorder
  const handleStartRender = async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      alert('Video canvas is not ready. Please preview first.');
      return;
    }

    setIsRecording(true);
    setRecordProgress(0);
    setExportSuccess(false);

    try {
      // Create canvas stream
      const stream = canvas.captureStream(30);

      // Add audio track if available
      const audioTrack = audioSynth.getAudioStreamTrack();
      if (audioTrack && config.bgMusicEnabled) {
        stream.addTrack(audioTrack);
        audioSynth.startMusic(config.musicMood);
      }

      // Check supported MIME type
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
      }

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 6000000, // 6 Mbps high quality
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        audioSynth.stopAll();
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setIsRecording(false);
        setExportSuccess(true);

        // Auto trigger download
        const a = document.createElement('a');
        a.href = url;
        const cleanName = config.title.replace(/[^a-zA-Z0-9]/g, '_') || 'video';
        a.download = `${cleanName}_${config.targetDuration}s_${config.aspectRatio.replace(':', 'x')}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      recorder.start();

      // Step through time precisely in realtime
      const startTime = performance.now();
      const intervalMs = 100;

      const timer = setInterval(() => {
        const elapsed = (performance.now() - startTime) / 1000;
        const progress = Math.min(100, (elapsed / totalDuration) * 100);
        setRecordProgress(Math.round(progress));

        if (elapsed >= totalDuration) {
          clearInterval(timer);
          recorder.stop();
        }
      }, intervalMs);

    } catch (err: any) {
      console.error('Recording error:', err);
      setIsRecording(false);
      audioSynth.stopAll();
      alert(`Export failed: ${err.message}`);
    }
  };

  // Generate Production Spec in Markdown
  const generateProductionSpec = (): string => {
    const isPortrait = config.aspectRatio === '9:16';
    const lines = [
      `# ${config.title}`,
      `**Target Duration:** ${config.targetDuration}s | **Aspect Ratio:** ${config.aspectRatio} (${isPortrait ? 'Portrait Vertical' : 'Landscape Widescreen'})`,
      `**Style:** ${config.style} | **Soundtrack:** ${config.musicMood}`,
      ``,
      `## Director's Creative Brief`,
      config.directorInstructions || 'Continuous narrative video pacing.',
      ``,
      `## Visual Assets Reference Catalog (${visuals.length} assets)`,
      ...visuals.map((v, i) => `${i + 1}. **${v.name}** [${v.aspectRatio}] - Tags: ${v.tags.join(', ')}`),
      ``,
      `## Continuous Scene-by-Scene Storyboard (${scenes.length} beats)`,
      ``,
    ];

    scenes.forEach((s) => {
      const asset = visuals.find(v => v.id === s.assignedAssetId);
      lines.push(
        `### Scene ${s.sceneNumber}: ${s.title}`,
        `- **Timecode:** ${formatTimecode(s.startTime)} - ${formatTimecode(s.startTime + s.duration)} (${s.duration}s)`,
        `- **Visual Reference:** ${asset ? asset.name : 'None assigned'}`,
        `- **Camera Motion:** ${s.cameraMotion.replace('_', ' ').toUpperCase()}`,
        `- **Transition Out:** ${s.transition} (${s.transitionDuration}s)`,
        `- **Script Beat / Narration:** "${s.scriptBeat}"`,
        `- **AI Video Prompt:** \`${s.visualPrompt}\``,
        `- **Lower-Third Overlay:** ${s.lowerThird ? `${s.lowerThird.title} • ${s.lowerThird.subtitle}` : 'None'}`,
        ``
      );
    });

    lines.push(
      `---`,
      `*Generated with DirectorFlow Continuous AI Video Studio*`
    );

    return lines.join('\n');
  };

  const copySpecToClipboard = () => {
    navigator.clipboard.writeText(generateProductionSpec());
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 2000);
  };

  const downloadSpecMarkdown = () => {
    const text = generateProductionSpec();
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.title.replace(/[^a-zA-Z0-9]/g, '_')}_Production_Brief.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-rose-500" />
            <h2 className="text-sm font-semibold text-zinc-100">
              Export Continuous Video & Production Pack
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/50 p-2 gap-2">
          <button
            onClick={() => setExportType('video')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              exportType === 'video'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Render Continuous Video File (.webm)</span>
          </button>

          <button
            onClick={() => setExportType('spec')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              exportType === 'spec'
                ? 'bg-zinc-800 text-zinc-100 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>AI Video Production Brief (.md)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {exportType === 'video' ? (
            <div className="space-y-4">
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <span className="font-semibold">Format Specification</span>
                  <span className="font-mono text-zinc-400">Continuous Stream</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400 pt-1">
                  <div>
                    <span className="text-zinc-500">Duration: </span>
                    <span className="text-zinc-200 font-mono font-bold">{totalDuration}s</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Aspect Ratio: </span>
                    <span className="text-zinc-200 font-mono font-bold">{config.aspectRatio}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Resolution: </span>
                    <span className="text-zinc-200 font-mono">
                      {config.aspectRatio === '9:16' ? '720 x 1280 (Portrait)' : '1280 x 720 (Landscape)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Transitions & Motion: </span>
                    <span className="text-zinc-200">Continuous 30fps</span>
                  </div>
                </div>
              </div>

              {/* Recording progress state */}
              {isRecording && (
                <div className="space-y-2 bg-rose-950/20 border border-rose-900/40 p-4 rounded-xl">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-rose-300 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                      Rendering continuous video timeline...
                    </span>
                    <span className="font-mono text-rose-300 font-bold">{recordProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${recordProgress}%` }}
                      className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 transition-all duration-150"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Capturing high-bitrate video stream with camera choreography and cinematic transitions.
                  </p>
                </div>
              )}

              {/* Finished state */}
              {exportSuccess && (
                <div className="bg-emerald-950/30 border border-emerald-900/50 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                    <Check className="w-4 h-4" />
                    <span>Video rendered and saved successfully!</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Your continuous {config.targetDuration}s video file has been generated. If the download did not start automatically, click below:
                  </p>
                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      download={`${config.title.replace(/[^a-zA-Z0-9]/g, '_')}_${config.targetDuration}s.webm`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Video File Again</span>
                    </a>
                  )}
                </div>
              )}

              {/* Start button */}
              {!isRecording && (
                <button
                  onClick={handleStartRender}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-rose-600 via-rose-500 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 shadow-xl shadow-rose-950/50 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <Download className="w-4 h-4" />
                  <span>Start Rendering {totalDuration}s Video</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-300">
                  Ready-to-use production prompt deck for Veo, Runway Gen-3, Kling, or human film crew.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copySpecToClipboard}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs transition-colors"
                  >
                    {copiedSpec ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSpec ? 'Copied!' : 'Copy Deck'}</span>
                  </button>
                  <button
                    onClick={downloadSpecMarkdown}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download .MD</span>
                  </button>
                </div>
              </div>

              <textarea
                readOnly
                value={generateProductionSpec()}
                rows={12}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 font-mono leading-relaxed focus:outline-none resize-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
