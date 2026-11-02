import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Send, 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  Cpu, 
  Terminal, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Play
} from 'lucide-react';
import { VideoScene, VisualAsset, ProjectConfig } from '../types/index';
import { StylePreset, CaptionConfig } from '../types/styles';
import { PipelineConfig } from '../types/settings';
import { generateRemotionProjectBundle, dispatchToRemoteRenderer, RemotionProjectBundle } from '../utils/remotionExporter';

interface PipelineBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenes: VideoScene[];
  visuals: VisualAsset[];
  config: ProjectConfig;
  style: StylePreset;
  captionConfig: CaptionConfig;
  pipelineConfig: PipelineConfig;
}

export const PipelineBridgeModal: React.FC<PipelineBridgeModalProps> = ({
  isOpen,
  onClose,
  scenes,
  visuals,
  config,
  style,
  captionConfig,
  pipelineConfig,
}) => {
  const [activeEngine, setActiveEngine] = useState<'remotion' | 'hyperframe'>('remotion');
  const [selectedFile, setSelectedFile] = useState<keyof RemotionProjectBundle>('Composition.tsx');
  const [copied, setCopied] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<{ success: boolean; jobId: string; message: string } | null>(null);

  if (!isOpen) return null;

  const bundle = generateRemotionProjectBundle(
    scenes,
    visuals,
    config,
    style,
    captionConfig,
    pipelineConfig.remotionFps || 30
  );

  const filesList: (keyof RemotionProjectBundle)[] = activeEngine === 'remotion'
    ? ['Composition.tsx', 'Root.tsx', 'Subtitles.tsx', 'composition-props.json', 'remotion.config.ts', 'package.json']
    : ['hyperframe.config.json', 'composition-props.json'];

  const currentContent = bundle[selectedFile] || bundle['Composition.tsx'];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([currentContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDispatch = async () => {
    setIsDispatching(true);
    setDispatchResult(null);

    const endpoint = activeEngine === 'remotion'
      ? pipelineConfig.remotionServerUrl
      : pipelineConfig.hyperframeEndpointUrl;

    const token = activeEngine === 'remotion'
      ? pipelineConfig.remotionAuthToken
      : pipelineConfig.hyperframeApiKey;

    const payload = activeEngine === 'remotion'
      ? JSON.parse(bundle['composition-props.json'])
      : JSON.parse(bundle['hyperframe.config.json']);

    const res = await dispatchToRemoteRenderer(endpoint, activeEngine, payload, token);
    setIsDispatching(false);
    setDispatchResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                Remotion & Hyperframe Pipeline Bridge
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  READY TO DISPATCH
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Render via Remotion server/Lambda or Hyperframe declarative cloud workers.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Engine Switcher & Remote Dispatch Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/40 px-4 py-2.5 gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveEngine('remotion');
                setSelectedFile('Composition.tsx');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeEngine === 'remotion'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Remotion Pipeline</span>
            </button>

            <button
              onClick={() => {
                setActiveEngine('hyperframe');
                setSelectedFile('hyperframe.config.json');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeEngine === 'hyperframe'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Hyperframe Pipeline</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDispatch}
              disabled={isDispatching}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {isDispatching ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Dispatching to {activeEngine}...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Render to {activeEngine.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dispatch Result Alert */}
        {dispatchResult && (
          <div className={`px-4 py-2.5 border-b text-xs flex items-center justify-between ${
            dispatchResult.success 
              ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-300' 
              : 'bg-rose-950/40 border-rose-900/60 text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              {dispatchResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{dispatchResult.message}</span>
              {dispatchResult.jobId && <span className="font-mono bg-black/40 px-1.5 py-0.5 rounded">ID: {dispatchResult.jobId}</span>}
            </div>
            <button onClick={() => setDispatchResult(null)} className="text-zinc-400 hover:text-zinc-200 text-xs">Dismiss</button>
          </div>
        )}

        {/* Modal Main Content: File Explorer & Code Viewer */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* File sidebar */}
          <div className="w-56 border-r border-zinc-800 bg-zinc-900/40 p-2.5 space-y-1 overflow-y-auto shrink-0">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-2 py-1 block">
              Generated Code Files
            </span>
            {filesList.map((fileName) => (
              <button
                key={fileName}
                onClick={() => setSelectedFile(fileName)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center justify-between ${
                  selectedFile === fileName
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <span className="truncate">{fileName}</span>
              </button>
            ))}

            <div className="pt-4 px-2 space-y-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
              <p className="font-medium text-zinc-300">Run Locally with CLI:</p>
              <div className="bg-black/60 p-2 rounded border border-zinc-800 font-mono text-[10px] text-indigo-300 overflow-x-auto">
                npx remotion render Composition out/video.mp4 --props=props.json
              </div>
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-zinc-950">
            {/* Action toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/20 shrink-0">
              <span className="text-xs font-mono text-zinc-300 font-semibold">{selectedFile}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownloadFile}
                  className="flex items-center gap-1 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="flex-1 p-4 overflow-auto">
              <pre className="text-xs font-mono text-zinc-300 leading-relaxed select-text">
                {currentContent}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
