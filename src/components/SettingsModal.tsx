import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Cpu, 
  Video, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Check, 
  Key, 
  Globe, 
  Radio, 
  Layers, 
  Download, 
  Upload, 
  RotateCcw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { AppSettings, ModelConfig, ModelCategory, PipelineConfig } from '../types/settings';
import { saveSettings, INITIAL_MODELS, INITIAL_PIPELINE } from '../utils/settingsStorage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'llm' | 'video' | 'image' | 'pipeline' | 'backup'>('llm');
  const [isAddingModel, setIsAddingModel] = useState(false);

  // New model form state
  const [newModel, setNewModel] = useState<Partial<ModelConfig>>({
    name: '',
    provider: 'Custom',
    category: 'llm',
    modelIdentifier: '',
    endpointUrl: '',
    apiKey: '',
    authHeaderType: 'Bearer',
    description: '',
  });

  if (!isOpen) return null;

  const handleSelectActiveModel = (category: ModelCategory, id: string) => {
    let updated: Partial<AppSettings> = {};
    if (category === 'llm') updated.selectedLlmId = id;
    if (category === 'video') updated.selectedVideoModelId = id;
    if (category === 'image') updated.selectedImageModelId = id;

    const next = { ...settings, ...updated };
    onUpdateSettings(next);
    saveSettings(next);
  };

  const handleToggleModelEnabled = (id: string, isEnabled: boolean) => {
    const updatedModels = settings.models.map(m => m.id === id ? { ...m, isEnabled } : m);
    const next = { ...settings, models: updatedModels };
    onUpdateSettings(next);
    saveSettings(next);
  };

  const handleUpdateModelFields = (id: string, fields: Partial<ModelConfig>) => {
    const updatedModels = settings.models.map(m => m.id === id ? { ...m, ...fields } : m);
    const next = { ...settings, models: updatedModels };
    onUpdateSettings(next);
    saveSettings(next);
  };

  const handleDeleteModel = (id: string) => {
    const updatedModels = settings.models.filter(m => m.id !== id);
    const next = { ...settings, models: updatedModels };
    onUpdateSettings(next);
    saveSettings(next);
  };

  const handleSaveNewModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel.name || !newModel.modelIdentifier) return;

    const created: ModelConfig = {
      id: `custom-${Date.now()}`,
      name: newModel.name,
      provider: newModel.provider || 'Custom',
      category: newModel.category || activeTab as ModelCategory,
      modelIdentifier: newModel.modelIdentifier,
      endpointUrl: newModel.endpointUrl || '',
      apiKey: newModel.apiKey || '',
      authHeaderType: newModel.authHeaderType || 'Bearer',
      isBuiltIn: false,
      isEnabled: true,
      description: newModel.description || 'Custom added user model endpoint.',
      badge: 'Custom',
    };

    const next = {
      ...settings,
      models: [...settings.models, created],
    };
    onUpdateSettings(next);
    saveSettings(next);

    // Reset form
    setNewModel({
      name: '',
      provider: 'Custom',
      category: activeTab as ModelCategory,
      modelIdentifier: '',
      endpointUrl: '',
      apiKey: '',
      authHeaderType: 'Bearer',
      description: '',
    });
    setIsAddingModel(false);
  };

  const handleUpdatePipeline = (updatedFields: Partial<PipelineConfig>) => {
    const next = {
      ...settings,
      pipeline: { ...settings.pipeline, ...updatedFields },
    };
    onUpdateSettings(next);
    saveSettings(next);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `directorflow_settings_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported && imported.models) {
          onUpdateSettings(imported);
          saveSettings(imported);
          alert('Settings successfully restored from backup.');
        }
      } catch (err: any) {
        alert(`Failed to import JSON: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all model endpoints and pipeline configs to factory defaults?')) {
      const initial: AppSettings = {
        selectedLlmId: 'llm-gemini-3.8-flash',
        selectedVideoModelId: 'vid-gemini-omni-flash',
        selectedImageModelId: 'img-nano-banana-pro',
        models: INITIAL_MODELS,
        pipeline: INITIAL_PIPELINE,
      };
      onUpdateSettings(initial);
      saveSettings(initial);
    }
  };

  const currentCategoryModels = settings.models.filter(m => m.category === activeTab);
  const activeSelectedId = activeTab === 'llm' 
    ? settings.selectedLlmId 
    : activeTab === 'video' 
    ? settings.selectedVideoModelId 
    : settings.selectedImageModelId;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 via-indigo-500 to-cyan-500 flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                External Models & Render Engine Settings
              </h2>
              <p className="text-[11px] text-zinc-400">
                Configure external LLMs, Video Models, Image Models, Remotion & Hyperframe bridges.
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

        {/* Tab Bar */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/30 p-2 gap-1.5 shrink-0 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('llm'); setIsAddingModel(false); }}
            className={`flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'llm' ? 'bg-rose-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>LLMs & Scripts ({settings.models.filter(m => m.category === 'llm').length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('video'); setIsAddingModel(false); }}
            className={`flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'video' ? 'bg-rose-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video Models ({settings.models.filter(m => m.category === 'video').length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('image'); setIsAddingModel(false); }}
            className={`flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'image' ? 'bg-rose-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Image Models ({settings.models.filter(m => m.category === 'image').length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('pipeline'); setIsAddingModel(false); }}
            className={`flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'pipeline' ? 'bg-rose-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Remotion / Hyperframe Endpoints</span>
          </button>

          <button
            onClick={() => { setActiveTab('backup'); setIsAddingModel(false); }}
            className={`flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'backup' ? 'bg-rose-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup & Sync</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 min-h-0 space-y-4">
          {/* MODEL CATEGORY TABS (LLM, VIDEO, IMAGE) */}
          {['llm', 'video', 'image'].includes(activeTab) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                    {activeTab === 'llm' ? 'Screenplay & Narrative LLMs' : activeTab === 'video' ? 'Video Generation Models (Veo, Omni, Runway, etc.)' : 'Image Reference Models (DALL-E, Nano Banana, Midjourney)'}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Select your primary active engine or connect new custom endpoints.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingModel(!isAddingModel)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New {activeTab.toUpperCase()}</span>
                </button>
              </div>

              {/* Add New Model Form */}
              {isAddingModel && (
                <form onSubmit={handleSaveNewModel} className="p-4 rounded-xl border border-rose-500/40 bg-zinc-900/80 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <span className="text-xs font-semibold text-rose-300">
                      Add New {activeTab.toUpperCase()} Endpoint
                    </span>
                    <button type="button" onClick={() => setIsAddingModel(false)} className="text-zinc-400 hover:text-zinc-200">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Display Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Grok 3 / Luma 3.0 / Kling Pro"
                        value={newModel.name}
                        onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Provider / Company</label>
                      <input
                        type="text"
                        placeholder="e.g. xAI, Runway, DeepSeek, Local"
                        value={newModel.provider}
                        onChange={(e) => setNewModel({ ...newModel, provider: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Model Identifier / String *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. grok-3-mini, luma-ray-3, flux-ultra"
                        value={newModel.modelIdentifier}
                        onChange={(e) => setNewModel({ ...newModel, modelIdentifier: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Endpoint URL (Optional)</label>
                      <input
                        type="url"
                        placeholder="https://api.yourprovider.com/v1/..."
                        value={newModel.endpointUrl}
                        onChange={(e) => setNewModel({ ...newModel, endpointUrl: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">API Key / Token (Saved locally only)</label>
                    <input
                      type="password"
                      placeholder="sk-..."
                      value={newModel.apiKey}
                      onChange={(e) => setNewModel({ ...newModel, apiKey: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Description / Notes</label>
                    <input
                      type="text"
                      placeholder="Brief notes on performance, resolution or speed..."
                      value={newModel.description}
                      onChange={(e) => setNewModel({ ...newModel, description: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingModel(false)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold"
                    >
                      Save Model
                    </button>
                  </div>
                </form>
              )}

              {/* Models List */}
              <div className="space-y-2.5">
                {currentCategoryModels.map((model) => {
                  const isActive = activeSelectedId === model.id;
                  return (
                    <div
                      key={model.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isActive
                          ? 'border-rose-500/80 bg-rose-950/20 ring-1 ring-rose-500/30'
                          : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Active Selector Radio */}
                          <button
                            onClick={() => handleSelectActiveModel(model.category, model.id)}
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                              isActive ? 'border-rose-500 bg-rose-600' : 'border-zinc-600 hover:border-zinc-400'
                            }`}
                            title="Set as active primary model"
                          >
                            {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-zinc-100">{model.name}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                                {model.provider}
                              </span>
                              {model.badge && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
                                  {model.badge}
                                </span>
                              )}
                              {isActive && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-0.5">{model.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!model.isBuiltIn && (
                            <button
                              onClick={() => handleDeleteModel(model.id)}
                              className="p-1 text-zinc-500 hover:text-rose-400 rounded transition-colors"
                              title="Delete custom model"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Endpoint and Key Input (editable in-place) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-800/80 text-xs">
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <input
                            type="text"
                            placeholder={model.endpointUrl || 'Default SDK cloud route'}
                            value={model.endpointUrl || ''}
                            onChange={(e) => handleUpdateModelFields(model.id, { endpointUrl: e.target.value })}
                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-200 font-mono focus:outline-none focus:border-rose-500"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <Key className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <input
                            type="password"
                            placeholder={model.isBuiltIn ? 'Using configured project secret' : 'Paste API Key'}
                            value={model.apiKey || ''}
                            onChange={(e) => handleUpdateModelFields(model.id, { apiKey: e.target.value })}
                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-200 font-mono focus:outline-none focus:border-rose-500"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: REMOTION & HYPERFRAME PIPELINE CONFIG */}
          {activeTab === 'pipeline' && (
            <div className="space-y-5">
              {/* Remotion Pipeline Card */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500" />
                    <span className="text-xs font-semibold text-zinc-100">Remotion Rendering Bridge</span>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
                    Remotion 4.0 Ready
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Server / Lambda Webhook URL</label>
                    <input
                      type="text"
                      value={settings.pipeline.remotionServerUrl}
                      onChange={(e) => handleUpdatePipeline({ remotionServerUrl: e.target.value })}
                      placeholder="http://localhost:8000/render"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Remotion Auth Token</label>
                    <input
                      type="password"
                      value={settings.pipeline.remotionAuthToken}
                      onChange={(e) => handleUpdatePipeline({ remotionAuthToken: e.target.value })}
                      placeholder="Bearer token or secret..."
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Default FPS</label>
                    <select
                      value={settings.pipeline.remotionFps}
                      onChange={(e) => handleUpdatePipeline({ remotionFps: parseInt(e.target.value, 10) })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-100"
                    >
                      <option value={30}>30 FPS (Standard Web & Social)</option>
                      <option value={60}>60 FPS (Ultra Smooth Motion)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Output Codec</label>
                    <select
                      value={settings.pipeline.remotionCodec}
                      onChange={(e) => handleUpdatePipeline({ remotionCodec: e.target.value as any })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-100"
                    >
                      <option value="h264">H.264 (Maximum Compatibility)</option>
                      <option value="h265">H.265 / HEVC</option>
                      <option value="vp9">VP9 (High Web Quality)</option>
                      <option value="prores">Apple ProRes (Master Quality)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Hyperframe Pipeline Card */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-cyan-500" />
                    <span className="text-xs font-semibold text-zinc-100">Hyperframe Declarative Cloud Pipeline</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                    Hyperframe v2.0
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Hyperframe Endpoint URL</label>
                    <input
                      type="text"
                      value={settings.pipeline.hyperframeEndpointUrl}
                      onChange={(e) => handleUpdatePipeline({ hyperframeEndpointUrl: e.target.value })}
                      placeholder="https://api.hyperframe.io/v1/jobs"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Hyperframe API Key</label>
                    <input
                      type="password"
                      value={settings.pipeline.hyperframeApiKey}
                      onChange={(e) => handleUpdatePipeline({ hyperframeApiKey: e.target.value })}
                      placeholder="hyp_live_..."
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                <span className="text-xs font-semibold text-zinc-200 block">
                  Export & Import Settings Configuration
                </span>
                <p className="text-[11px] text-zinc-400">
                  Save all configured external model endpoints, custom additions, and pipeline endpoints as a portable JSON file.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleExportJson}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Settings JSON</span>
                  </button>

                  <label className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-medium cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import Settings JSON</span>
                    <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-rose-950/60 bg-rose-950/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-rose-300 block">Factory Reset Settings</span>
                  <span className="text-[11px] text-zinc-400">Restore original pre-configured model roster and pipeline presets.</span>
                </div>
                <button
                  onClick={handleResetDefaults}
                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
