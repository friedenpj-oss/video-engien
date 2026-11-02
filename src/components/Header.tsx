import React from 'react';
import { 
  Play, 
  Film, 
  Download, 
  FileText, 
  Monitor, 
  Smartphone, 
  Sparkles,
  Layers
} from 'lucide-react';
import { AspectRatio, ProjectConfig } from '../types/index';
import { SAMPLE_PROJECTS, SampleProject } from '../data/sampleProjects';

interface HeaderProps {
  config: ProjectConfig;
  onUpdateConfig: (updated: Partial<ProjectConfig>) => void;
  onLoadSample: (sample: SampleProject) => void;
  onOpenExport: () => void;
  onExportSpec: () => void;
  sceneCount: number;
  totalDuration: number;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onUpdateConfig,
  onLoadSample,
  onOpenExport,
  onExportSpec,
  sceneCount,
  totalDuration,
}) => {
  const [isSampleMenuOpen, setIsSampleMenuOpen] = React.useState(false);
  const durations = [30, 60, 90, 120];

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md px-4 flex items-center justify-between z-20 shrink-0">
      {/* Brand & Project Name */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-900/20">
          <Film className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold tracking-wide text-zinc-100 flex items-center gap-1.5">
              DirectorFlow
              <span className="text-[10px] font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded">
                CONTINUOUS AI VIDEO
              </span>
            </h1>
          </div>
          <p className="text-xs text-zinc-400 truncate max-w-xs md:max-w-md">
            {config.title || 'Untitled Continuous Video Project'}
          </p>
        </div>
      </div>

      {/* Middle Controls: Target Duration & Aspect Ratio */}
      <div className="hidden lg:flex items-center gap-4 bg-zinc-900/90 border border-zinc-800 p-1 rounded-xl">
        {/* Duration Badges */}
        <div className="flex items-center gap-1 px-1">
          <span className="text-[11px] font-medium text-zinc-400 px-1.5 uppercase tracking-wider">
            Target:
          </span>
          {durations.map((d) => (
            <button
              key={d}
              onClick={() => onUpdateConfig({ targetDuration: d })}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                config.targetDuration === d
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
              }`}
              title={`Set target duration to ${d} seconds`}
            >
              {d}s
            </button>
          ))}
          {/* Custom Duration Input */}
          <div className="flex items-center ml-1 text-xs text-zinc-400">
            <input
              type="number"
              min={10}
              max={300}
              value={config.targetDuration}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 5) onUpdateConfig({ targetDuration: val });
              }}
              className="w-12 bg-zinc-950 border border-zinc-700 rounded px-1.5 py-0.5 text-center text-zinc-200 focus:outline-none focus:border-rose-500 font-mono text-xs"
              title="Custom duration in seconds"
            />
            <span className="ml-1 text-[11px] text-zinc-400">s</span>
          </div>
        </div>

        <div className="h-4 w-px bg-zinc-700/60" />

        {/* Aspect Ratio Switcher */}
        <div className="flex items-center gap-1 px-1">
          <button
            onClick={() => onUpdateConfig({ aspectRatio: '16:9' })}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              config.aspectRatio === '16:9'
                ? 'bg-zinc-800 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
            title="16:9 Landscape Widescreen (YouTube / TV / Cinema)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>16:9 Landscape</span>
          </button>

          <button
            onClick={() => onUpdateConfig({ aspectRatio: '9:16' })}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              config.aspectRatio === '9:16'
                ? 'bg-zinc-800 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
            title="9:16 Portrait Vertical (Reels / TikTok / Shorts)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>9:16 Portrait</span>
          </button>
        </div>
      </div>

      {/* Right Actions: Sample Presets, Spec, and Export Video */}
      <div className="flex items-center gap-2">
        {/* Sample Projects Selector */}
        <div className="relative">
          <button
            onClick={() => setIsSampleMenuOpen(!isSampleMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg transition-colors"
            title="Load ready-made continuous video projects"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Load Sample</span>
          </button>
          
          {isSampleMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-72 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50">
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-2 py-1">
                Pre-built Continuous Projects
              </div>
              {SAMPLE_PROJECTS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => {
                    onLoadSample(sample);
                    setIsSampleMenuOpen(false);
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-zinc-800 transition-colors group/item block"
                >
                  <div className="text-xs font-medium text-zinc-200 group-hover/item:text-rose-400">
                    {sample.name}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    {sample.badge}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Export Storyboard / Brief */}
        <button
          onClick={onExportSpec}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg transition-colors"
          title="Export production script & AI video prompt brief"
        >
          <FileText className="w-3.5 h-3.5 text-zinc-400" />
          <span>Export Spec</span>
        </button>

        {/* Export Continuous Video */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white rounded-lg shadow-md shadow-rose-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          title="Record and render continuous video file"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Render & Export Video</span>
        </button>
      </div>
    </header>
  );
};
