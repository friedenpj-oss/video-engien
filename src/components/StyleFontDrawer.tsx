import React, { useState } from 'react';
import { 
  X, 
  Palette, 
  Type, 
  Sparkles, 
  Check, 
  Sliders, 
  Eye, 
  Film, 
  Flame, 
  Smartphone, 
  Music, 
  Monitor, 
  Zap,
  Volume2
} from 'lucide-react';
import { StylePreset, FontPreset, CaptionConfig } from '../types/styles';
import { STYLE_PRESETS } from '../data/styleLibrary';
import { FONT_PRESETS, loadGoogleFont } from '../data/fontLibrary';

interface StyleFontDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentStyle: StylePreset;
  onSelectStyle: (style: StylePreset) => void;
  onUpdateStyle: (updated: Partial<StylePreset>) => void;
  captionConfig: CaptionConfig;
  onUpdateCaptionConfig: (updated: Partial<CaptionConfig>) => void;
}

export const StyleFontDrawer: React.FC<StyleFontDrawerProps> = ({
  isOpen,
  onClose,
  currentStyle,
  onSelectStyle,
  onUpdateStyle,
  captionConfig,
  onUpdateCaptionConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'styles' | 'fonts' | 'captions'>('styles');
  const [fontFilter, setFontFilter] = useState<string>('all');

  if (!isOpen) return null;

  const filteredFonts = fontFilter === 'all' 
    ? FONT_PRESETS 
    : FONT_PRESETS.filter(f => f.category === fontFilter);

  const handleSelectFont = (font: FontPreset) => {
    loadGoogleFont(font.fontFamily);
    onUpdateCaptionConfig({ fontFamily: font.fontFamily });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-xl h-full bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center">
              <Palette className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Style & Font Studio</h2>
              <p className="text-[11px] text-zinc-400">Cinematic LUTs, Short Reels, Music Videos & Typography</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/30 p-2 gap-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('styles')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'styles'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Style Presets</span>
          </button>

          <button
            onClick={() => setActiveTab('fonts')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'fonts'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Font Library</span>
          </button>

          <button
            onClick={() => setActiveTab('captions')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'captions'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Kinetic Captions</span>
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: STYLE PRESETS */}
          {activeTab === 'styles' && (
            <div className="space-y-4">
              <div className="text-xs text-zinc-400">
                Choose a visual identity tailored for Short Reels, Feature Films, Music Videos, or Keynotes:
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {STYLE_PRESETS.map((preset) => {
                  const isSelected = currentStyle.id === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => onSelectStyle(preset)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-rose-500 bg-rose-950/20 ring-1 ring-rose-500/40 shadow-lg'
                          : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          {preset.category === 'short_reel' && <Smartphone className="w-4 h-4 text-rose-400" />}
                          {preset.category === 'cinematic' && <Film className="w-4 h-4 text-amber-400" />}
                          {preset.category === 'music_video' && <Music className="w-4 h-4 text-indigo-400" />}
                          {preset.category === 'commercial' && <Monitor className="w-4 h-4 text-emerald-400" />}
                          {preset.category === 'cyberpunk' && <Zap className="w-4 h-4 text-cyan-400" />}
                          {preset.category === 'vintage' && <Flame className="w-4 h-4 text-orange-400" />}
                          <span className="text-xs font-semibold text-zinc-100">{preset.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                            {preset.badge}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-rose-400" />}
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {preset.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-400 font-mono">
                        <span>LUT: {preset.lutFilter}</span>
                        <span>•</span>
                        <span>Grain: {Math.round(preset.filmGrain * 100)}%</span>
                        <span>•</span>
                        <span>Physics: {preset.springStiffness}k/{preset.springDamping}d</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Fine-Tuning Sliders for Current Style */}
              <div className="mt-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-200">Active Style Tweaks</span>
                  <span className="text-[10px] text-zinc-400">{currentStyle.name}</span>
                </div>

                {/* Film Grain */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-zinc-400">Film Grain Intensity</span>
                    <span className="font-mono text-zinc-200">{Math.round((currentStyle.filmGrain || 0) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={currentStyle.filmGrain || 0}
                    onChange={(e) => onUpdateStyle({ filmGrain: parseFloat(e.target.value) })}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>

                {/* Spring Stiffness */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-zinc-400">Remotion Spring Stiffness</span>
                    <span className="font-mono text-zinc-200">{currentStyle.springStiffness}k</span>
                  </div>
                  <input
                    type="range"
                    min={80}
                    max={300}
                    step={10}
                    value={currentStyle.springStiffness}
                    onChange={(e) => onUpdateStyle({ springStiffness: parseInt(e.target.value, 10) })}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>

                {/* Letterbox toggle */}
                <label className="flex items-center justify-between text-xs text-zinc-300 pt-2 border-t border-zinc-800 cursor-pointer">
                  <span>Cinematic 2.39:1 Letterbox Bars</span>
                  <input
                    type="checkbox"
                    checked={currentStyle.letterbox}
                    onChange={(e) => onUpdateStyle({ letterbox: e.target.checked })}
                    className="rounded border-zinc-700 bg-zinc-900 text-rose-500"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: FONT LIBRARY */}
          {activeTab === 'fonts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Select typography preset:</span>
                <div className="flex gap-1 text-[10px]">
                  {['all', 'social_bold', 'cinematic', 'tech_cyber', 'handwritten'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFontFilter(f)}
                      className={`px-2 py-0.5 rounded capitalize ${
                        fontFilter === f ? 'bg-rose-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {f.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {filteredFonts.map((font) => {
                  const isSelected = captionConfig.fontFamily.toLowerCase() === font.fontFamily.toLowerCase();
                  return (
                    <div
                      key={font.id}
                      onClick={() => handleSelectFont(font)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-rose-500 bg-rose-950/20 ring-1 ring-rose-500/40 shadow-sm'
                          : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-zinc-200">{font.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] uppercase px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded">
                            {font.category.replace('_', ' ')}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-rose-400" />}
                        </div>
                      </div>

                      {/* Live preview phrase in this font */}
                      <div
                        style={{ fontFamily: font.fontFamily }}
                        className="text-lg text-zinc-100 py-1.5 truncate tracking-wide"
                      >
                        {font.previewSample}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: KINETIC CAPTIONS & SUBTITLES */}
          {activeTab === 'captions' && (
            <div className="space-y-4">
              {/* Live Preview Card */}
              <div className="p-4 rounded-xl bg-black border border-zinc-800 flex flex-col items-center justify-center min-h-[120px] relative overflow-hidden">
                <span className="text-[10px] text-zinc-500 absolute top-2 left-2 uppercase tracking-wider font-mono">
                  Live Subtitle Preview
                </span>

                <div className="py-2 px-5 rounded-2xl bg-black/75 backdrop-blur-md flex items-center gap-2 border border-white/10">
                  <span
                    style={{
                      fontFamily: captionConfig.fontFamily,
                      fontSize: 18,
                      fontWeight: captionConfig.fontWeight,
                      color: captionConfig.highlightColor,
                      textTransform: captionConfig.textTransform,
                      letterSpacing: `${captionConfig.tracking}px`,
                      textShadow: `0 2px 8px ${captionConfig.dropShadowColor}`,
                    }}
                  >
                    CONTINUOUS
                  </span>
                  <span
                    style={{
                      fontFamily: captionConfig.fontFamily,
                      fontSize: 18,
                      fontWeight: captionConfig.fontWeight,
                      color: captionConfig.textColor,
                      textTransform: captionConfig.textTransform,
                      letterSpacing: `${captionConfig.tracking}px`,
                      textShadow: `0 2px 8px ${captionConfig.dropShadowColor}`,
                    }}
                  >
                    VIDEO KINETICS
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-3">
                {/* Animation Mode */}
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">
                    Kinetic Animation Mode
                  </label>
                  <select
                    value={captionConfig.animationMode}
                    onChange={(e) => onUpdateCaptionConfig({ animationMode: e.target.value as any })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="word_kinetic">Word-by-Word Kinetic Pulse (TikTok / Reels)</option>
                    <option value="karaoke_sweep">Karaoke Sweep Highlight</option>
                    <option value="spring_bounce">Spring Bounce Reveal (Remotion)</option>
                    <option value="fade_up">Cinematic Fade Up</option>
                    <option value="typewriter">Terminal Typewriter</option>
                    <option value="static">Static Subtitle</option>
                  </select>
                </div>

                {/* Color pickers */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-zinc-400 block mb-1">Active Highlight Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={captionConfig.highlightColor}
                        onChange={(e) => onUpdateCaptionConfig({ highlightColor: e.target.value })}
                        className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                      />
                      <span className="text-xs font-mono text-zinc-300">{captionConfig.highlightColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-zinc-400 block mb-1">Base Text Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={captionConfig.textColor}
                        onChange={(e) => onUpdateCaptionConfig({ textColor: e.target.value })}
                        className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                      />
                      <span className="text-xs font-mono text-zinc-300">{captionConfig.textColor}</span>
                    </div>
                  </div>
                </div>

                {/* Font Size & Tracking */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-zinc-400">Font Size</span>
                      <span className="font-mono text-zinc-200">{captionConfig.fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={16}
                      max={48}
                      value={captionConfig.fontSize}
                      onChange={(e) => onUpdateCaptionConfig({ fontSize: parseInt(e.target.value, 10) })}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-zinc-400">Tracking (Kerning)</span>
                      <span className="font-mono text-zinc-200">{captionConfig.tracking}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={6}
                      value={captionConfig.tracking}
                      onChange={(e) => onUpdateCaptionConfig({ tracking: parseInt(e.target.value, 10) })}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Text Transform */}
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">Text Casing</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['none', 'uppercase', 'capitalize'].map((t) => (
                      <button
                        key={t}
                        onClick={() => onUpdateCaptionConfig({ textTransform: t as any })}
                        className={`py-1 text-xs rounded-lg border font-mono ${
                          captionConfig.textTransform === t
                            ? 'bg-rose-600 text-white border-rose-500'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
