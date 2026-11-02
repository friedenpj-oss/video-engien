import React, { useRef, useState } from 'react';
import { 
  Upload, 
  FolderUp, 
  Archive, 
  FileText, 
  Image as ImageIcon, 
  Sliders, 
  Sparkles, 
  Trash2, 
  Eye, 
  FileCode,
  Music,
  CheckCircle,
  AlertCircle,
  Wand2
} from 'lucide-react';
import { VisualAsset, ScriptDocument, ProjectConfig } from '../types/index';
import { ingestFileList, getFilesFromDataTransfer } from '../utils/fileExtractors';

interface AssetHubProps {
  visuals: VisualAsset[];
  documents: ScriptDocument[];
  config: ProjectConfig;
  scriptText: string;
  onUpdateScriptText: (text: string) => void;
  onUpdateConfig: (updated: Partial<ProjectConfig>) => void;
  onAddVisuals: (visuals: VisualAsset[]) => void;
  onRemoveVisual: (id: string) => void;
  onAddDocuments: (docs: ScriptDocument[]) => void;
  onRemoveDocument: (id: string) => void;
  onRunSequencing: () => void;
  isSequencing: boolean;
  assignedAssetIds: Set<string>;
}

export const AssetHub: React.FC<AssetHubProps> = ({
  visuals,
  documents,
  config,
  scriptText,
  onUpdateScriptText,
  onUpdateConfig,
  onAddVisuals,
  onRemoveVisual,
  onAddDocuments,
  onRemoveDocument,
  onRunSequencing,
  isSequencing,
  assignedAssetIds,
}) => {
  const [activeTab, setActiveTab] = useState<'visuals' | 'script' | 'director'>('visuals');
  const [isDragging, setIsDragging] = useState(false);
  const [ingestLogs, setIngestLogs] = useState<string[]>([]);
  const [previewAsset, setPreviewAsset] = useState<VisualAsset | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFiles = async (files: FileList | File[]) => {
    try {
      const result = await ingestFileList(files);
      if (result.visuals.length > 0) {
        onAddVisuals(result.visuals);
      }
      if (result.documents.length > 0) {
        onAddDocuments(result.documents);
        // If scriptText is empty and document has content, populate it
        if (!scriptText && result.documents[0]?.content) {
          onUpdateScriptText(result.documents[0].content);
        }
      }
      setIngestLogs(prev => [...result.logs, ...prev].slice(0, 5));
    } catch (err: any) {
      setIngestLogs(prev => [`Failed to parse files: ${err.message}`, ...prev]);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer) {
      const files = await getFilesFromDataTransfer(e.dataTransfer);
      await handleProcessFiles(files);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800 text-zinc-100 overflow-hidden">
      {/* Top Tabs */}
      <div className="flex items-center border-b border-zinc-800 bg-zinc-900/50 p-1.5 shrink-0 gap-1">
        <button
          onClick={() => setActiveTab('visuals')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'visuals'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
          <span>Visuals ({visuals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('script')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'script'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          <span>Script ({documents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('director')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'director'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>Director</span>
        </button>
      </div>

      {/* Drop Zone Area (Always accessible at top of panel) */}
      <div className="p-3 border-b border-zinc-800 bg-zinc-900/30 shrink-0">
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-xl p-3 text-center transition-all ${
            isDragging 
              ? 'border-rose-500 bg-rose-500/10 scale-[0.99]' 
              : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/40'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <Archive className="w-4 h-4 text-rose-400" />
            <FolderUp className="w-4 h-4 text-amber-400" />
            <FileCode className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xs font-semibold text-zinc-200">
            Drop ZIP, Folder, PDF, Markdown or Images
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Unpacks zips & directories automatically into scenes
          </p>

          <div className="flex items-center justify-center gap-2 mt-2.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700/60 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-zinc-400" />
              <span>Choose Files / Zip</span>
            </button>

            <button
              onClick={() => folderInputRef.current?.click()}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700/60 transition-colors"
            >
              <FolderUp className="w-3.5 h-3.5 text-zinc-400" />
              <span>Upload Folder</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && handleProcessFiles(e.target.files)}
              multiple
              accept=".zip,.png,.jpg,.jpeg,.webp,.svg,.md,.txt,.pdf,.docx,.json"
              className="hidden"
            />

            <input
              type="file"
              ref={folderInputRef}
              onChange={(e) => e.target.files && handleProcessFiles(e.target.files)}
              // @ts-ignore
              webkitdirectory=""
              directory=""
              multiple
              className="hidden"
            />
          </div>
        </div>

        {/* Recent Ingest Status Logs */}
        {ingestLogs.length > 0 && (
          <div className="mt-2 text-[10px] text-zinc-400 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800/80 truncate font-mono">
            ℹ️ {ingestLogs[0]}
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* TAB 1: VISUALS CATALOG */}
        {activeTab === 'visuals' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300">
                Visual Assets Library ({visuals.length})
              </span>
              <span className="text-[11px] text-zinc-400">
                {visuals.filter(v => assignedAssetIds.has(v.id)).length} mapped to scenes
              </span>
            </div>

            {visuals.length === 0 ? (
              <div className="p-6 text-center border border-zinc-800/60 rounded-xl bg-zinc-900/20">
                <ImageIcon className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-xs text-zinc-400">No visual assets loaded yet.</p>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Upload a ZIP, pictures, or click "Load Sample" above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {visuals.map((asset) => {
                  const isAssigned = assignedAssetIds.has(asset.id);
                  return (
                    <div
                      key={asset.id}
                      className={`group relative rounded-xl border overflow-hidden bg-zinc-900/60 transition-all ${
                        isAssigned 
                          ? 'border-rose-500/50 ring-1 ring-rose-500/30' 
                          : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="aspect-video w-full bg-zinc-950 relative overflow-hidden flex items-center justify-center">
                        <img
                          src={asset.url}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Orientation Badge */}
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[9px] font-bold bg-black/70 backdrop-blur-sm text-zinc-300 rounded uppercase">
                          {asset.aspectRatio}
                        </span>

                        {/* Used in Scene Badge */}
                        {isAssigned && (
                          <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[9px] font-semibold bg-rose-600 text-white rounded flex items-center gap-0.5">
                            <CheckCircle className="w-2.5 h-2.5" />
                            <span>In Scene</span>
                          </span>
                        )}

                        {/* Hover Quick Actions */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => setPreviewAsset(asset)}
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg transition-colors"
                            title="Preview Image"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRemoveVisual(asset.id)}
                            className="p-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg transition-colors"
                            title="Delete Asset"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="p-2">
                        <p className="text-[11px] font-medium text-zinc-200 truncate" title={asset.name}>
                          {asset.name}
                        </p>
                        {asset.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {asset.tags.slice(0, 2).map((t, i) => (
                              <span key={i} className="text-[9px] px-1 py-0.2 bg-zinc-800 text-zinc-400 rounded">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SCRIPT & GUIDELINES */}
        {activeTab === 'script' && (
          <div className="space-y-3">
            {/* Attached Documents List */}
            {documents.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Attached Guideline Documents ({documents.length})
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate text-zinc-200">{doc.name}</span>
                        <span className="text-[9px] font-mono px-1 py-0.5 bg-zinc-800 text-zinc-400 rounded uppercase">
                          {doc.format}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onUpdateScriptText(doc.content)}
                          className="text-[10px] text-amber-400 hover:text-amber-300 font-medium"
                          title="Load into script editor"
                        >
                          Use Text
                        </button>
                        <button
                          onClick={() => onRemoveDocument(doc.id)}
                          className="text-zinc-500 hover:text-rose-400"
                          title="Remove document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Script Text Editor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Script Beats & Narrative Guidelines
                </label>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {scriptText.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                value={scriptText}
                onChange={(e) => onUpdateScriptText(e.target.value)}
                placeholder="Paste or write your script, scenes, dialogue, or timing cues here. (e.g. Scene 1: Sunrise over mountain peak...)"
                rows={10}
                className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-rose-500 rounded-xl p-3 text-xs text-zinc-200 font-mono leading-relaxed focus:outline-none resize-none"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Markdown headers (# Scene 1) and line breaks are automatically sequenced into consecutive video beats.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: DIRECTOR'S INSTRUCTIONS */}
        {activeTab === 'director' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Director's Creative Brief & Arrangement Rules
              </label>
              <textarea
                value={config.directorInstructions}
                onChange={(e) => onUpdateConfig({ directorInstructions: e.target.value })}
                placeholder="Give exact instructions on pacing, mood, shot framing, visual pairings, and narrative tone (e.g., 'Make it look like an epic trailer, prioritize image 2 for the climax, and sync cuts to fast tempo')."
                rows={4}
                className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-zinc-200 leading-relaxed focus:outline-none resize-none"
              />
            </div>

            {/* Cinematic Style Preset */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Cinematic Style
              </label>
              <select
                value={config.style}
                onChange={(e) => onUpdateConfig({ style: e.target.value as any })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="cinematic">Cinematic 4K Film (Anamorphic & Volumetric)</option>
                <option value="commercial">Sleek Commercial / Tech Launch</option>
                <option value="social_reel">High-Pace Social Reel (TikTok / Shorts)</option>
                <option value="documentary">Nature & Scientific Documentary</option>
                <option value="cyberpunk">Cyberpunk & Futuristic Neon</option>
              </select>
            </div>

            {/* Background Music Mood */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Soundtrack Mood
              </label>
              <select
                value={config.musicMood}
                onChange={(e) => onUpdateConfig({ musicMood: e.target.value as any })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="ambient_epic">Ambient Cinematic Drone & Chords</option>
                <option value="electronic_pulse">Electronic Synth Pulse</option>
                <option value="acoustic_warm">Warm Acoustic Resonance</option>
                <option value="cyberpunk">Dark Cyberpunk Bass & Pad</option>
              </select>
            </div>

            {/* Audio & Caption Toggles */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                <span>Speech Narration (TTS Voice)</span>
                <input
                  type="checkbox"
                  checked={config.audioNarrationEnabled}
                  onChange={(e) => onUpdateConfig({ audioNarrationEnabled: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-900 text-rose-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                <span>Cinematic Background Music</span>
                <input
                  type="checkbox"
                  checked={config.bgMusicEnabled}
                  onChange={(e) => onUpdateConfig({ bgMusicEnabled: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-900 text-rose-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                <span>Subtitles & Lower-Third Overlays</span>
                <input
                  type="checkbox"
                  checked={config.subtitlesEnabled}
                  onChange={(e) => onUpdateConfig({ subtitlesEnabled: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-900 text-rose-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Primary Action Bar */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-950 shrink-0">
        <button
          onClick={onRunSequencing}
          disabled={isSequencing}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-rose-600 via-rose-500 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 shadow-lg shadow-rose-950/40 disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          {isSequencing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Sequencing {config.targetDuration}s Continuous Video...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Sequence Continuous {config.targetDuration}s Video</span>
            </>
          )}
        </button>
        <p className="text-[10px] text-center text-zinc-400 mt-1.5">
          Analyzes guidelines, pairs uploaded visuals, and calibrates {config.aspectRatio} pacing.
        </p>
      </div>

      {/* Image Preview Modal */}
      {previewAsset && (
        <div 
          onClick={() => setPreviewAsset(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs font-semibold text-zinc-200 truncate">{previewAsset.name}</span>
              <span className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded uppercase">
                {previewAsset.aspectRatio}
              </span>
            </div>
            <div className="mt-2 flex-1 flex items-center justify-center overflow-hidden">
              <img src={previewAsset.url} alt={previewAsset.name} className="max-h-[60vh] rounded-lg object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
