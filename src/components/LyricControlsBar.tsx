import React, { useState } from 'react';
import { 
  Music, 
  Search, 
  Sparkles, 
  Layers, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Palette, 
  User, 
  Check, 
  Loader2,
  Calendar,
  Disc,
  Feather
} from 'lucide-react';
import { ProjectConfig, SongMetadata } from '../types/index';
import { StylePreset } from '../types/styles';

interface LyricControlsBarProps {
  config: ProjectConfig;
  onUpdateConfig: (updated: Partial<ProjectConfig>) => void;
  currentStyle: StylePreset;
  onSelectStyle: (style: StylePreset) => void;
  stylePresets: StylePreset[];
}

export const LyricControlsBar: React.FC<LyricControlsBarProps> = ({
  config,
  onUpdateConfig,
  currentStyle,
  onSelectStyle,
  stylePresets
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showMetadataEditor, setShowMetadataEditor] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const songMeta: SongMetadata = config.songMetadata || {
    trackTitle: 'ITALAWA',
    artistName: 'RABOSKI',
    releaseDate: '2025-06-12',
    songwriters: 'Raboski, Wondernitz',
    producers: 'Raboski Mix & Master Lab',
    tagline: 'ONE ARTIST. EVERY LAYER.',
    trackNumber: '04 / 04',
    artworkUrl: '/assets/aistudio/Italawa_royal_blue_lyric_poster-2_8da11d00.png',
    artistPhotoUrl: '/assets/aistudio/Raboski__Mixing___Mastering-8_144cdb4c.png'
  };

  const handleFetchMetadata = async (customQuery?: string) => {
    const q = customQuery || searchQuery;
    if (!q.trim()) return;

    setIsSearching(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch(`/api/music-metadata?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error('Metadata fetch failed');
      const data = await res.json();

      if (data.success && data.metadata) {
        onUpdateConfig({
          songMetadata: {
            ...songMeta,
            ...data.metadata
          }
        });
        setFeedbackMsg(`Loaded metadata for "${data.metadata.trackTitle}" by ${data.metadata.artistName}`);
        setTimeout(() => setFeedbackMsg(null), 4000);
      }
    } catch (err: any) {
      setFeedbackMsg(`Error: ${err.message || 'Could not fetch metadata'}`);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLoadRaboskiPreset = () => {
    // Select the Wondernitz style preset
    const wondernitz = stylePresets.find(s => s.id === 'style-wondernitz-torn-paper') || stylePresets[0];
    onSelectStyle(wondernitz);

    onUpdateConfig({
      aspectRatio: '9:16',
      backgroundType: 'procedural',
      proceduralBgStyle: 'royal_blue_torn_paper',
      songMetadata: {
        trackTitle: 'ITALAWA',
        artistName: 'RABOSKI',
        releaseDate: '2025-06-12',
        songwriters: 'Raboski & Wondernitz Soundworks',
        producers: 'Raboski (Mastering & Mix Lab)',
        tagline: 'ONE ARTIST. EVERY LAYER.',
        trackNumber: '04 / 04',
        artworkUrl: '/assets/aistudio/Italawa_royal_blue_lyric_poster-2_8da11d00.png',
        artistPhotoUrl: '/assets/aistudio/Raboski__Mixing___Mastering-8_144cdb4c.png',
      }
    });

    setFeedbackMsg('Applied Raboski - Italawa Poster Style & Metadata');
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleLoadSpotlightPreset = () => {
    const spotlight = stylePresets.find(s => s.id === 'style-studio-master-spotlight') || stylePresets[1];
    onSelectStyle(spotlight);

    onUpdateConfig({
      aspectRatio: '9:16',
      backgroundType: 'procedural',
      proceduralBgStyle: 'studio_mixer_sketch',
      songMetadata: {
        trackTitle: 'ITALAWA',
        artistName: 'RABOSKI',
        releaseDate: '2025-06-12',
        songwriters: 'Raboski, Wondernitz & Co.',
        producers: 'Raboski Mixing & Mastering',
        tagline: 'ONE ARTIST. EVERY LAYER.',
        trackNumber: '04 / 04',
        artworkUrl: '/assets/aistudio/Italawa_royal_blue_lyric_poster-2_8da11d00.png',
        artistPhotoUrl: '/assets/aistudio/Raboski__Mixing___Mastering-8_144cdb4c.png',
      }
    });

    setFeedbackMsg('Applied Studio Master Artist Spotlight Style');
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const currentBgType = config.backgroundType || 'procedural';

  return (
    <div className="bg-[#10131a] border-b border-white/10 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Left: Background Source Switcher */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          Background:
        </span>

        <div className="flex items-center bg-[#181c26] rounded-lg p-0.5 border border-white/5">
          <button
            onClick={() => onUpdateConfig({ backgroundType: 'picture' })}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium ${
              currentBgType === 'picture' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-400 hover:text-white'
            }`}
            title="Use uploaded images / visual assets as background"
          >
            <ImageIcon className="w-3 h-3" />
            Picture
          </button>

          <button
            onClick={() => onUpdateConfig({ backgroundType: 'video' })}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium ${
              currentBgType === 'video' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-400 hover:text-white'
            }`}
            title="Use background video"
          >
            <VideoIcon className="w-3 h-3" />
            Video
          </button>

          <button
            onClick={() => onUpdateConfig({ backgroundType: 'procedural' })}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium ${
              currentBgType === 'procedural' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-400 hover:text-white'
            }`}
            title="Use custom procedural canvas themes (Royal Blue Torn Paper, Studio Mixer Sketch, Night Highway, etc.)"
          >
            <Palette className="w-3 h-3" />
            Custom Background
          </button>
        </div>

        {/* Procedural Theme Selector if procedural is active */}
        {currentBgType === 'procedural' && (
          <select
            value={config.proceduralBgStyle || currentStyle.proceduralTheme || 'royal_blue_torn_paper'}
            onChange={(e) => onUpdateConfig({ proceduralBgStyle: e.target.value as any })}
            className="bg-[#181c26] border border-blue-500/30 text-blue-300 rounded-md px-2 py-1 focus:outline-none focus:border-blue-400 font-medium"
          >
            <option value="royal_blue_torn_paper">Royal Blue Torn Paper (User Poster 1)</option>
            <option value="studio_mixer_sketch">Studio Mixer & Monitor Sketch (User Poster 2)</option>
            <option value="night_highway">Night Highway (3D Road Perspective)</option>
            <option value="neon_mesh">Cyberpunk Neon Mesh</option>
            <option value="cosmic_nebula">Cosmic Deep Nebula</option>
            <option value="crt_vhs">Retro CRT VHS Scanlines</option>
          </select>
        )}
      </div>

      {/* Middle: Online Song Metadata Auto-Fetcher */}
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Auto-fetch song metadata online (e.g. Raboski Italawa, Kendrick, Billie)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFetchMetadata()}
            className="w-full bg-[#181c26] border border-white/10 rounded-md pl-8 pr-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
        </div>

        <button
          onClick={() => handleFetchMetadata()}
          disabled={isSearching}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium px-3 py-1 rounded-md flex items-center gap-1 transition-colors"
          title="Query online music databases for official song metadata, artwork and release year"
        >
          {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          Fetch
        </button>

        <button
          onClick={() => setShowMetadataEditor(!showMetadataEditor)}
          className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors flex items-center gap-1 ${
            showMetadataEditor 
              ? 'bg-white/10 text-white border-white/20' 
              : 'border-white/10 text-gray-300 hover:text-white'
          }`}
          title="Edit song credits, songwriter, producer and release info"
        >
          <Feather className="w-3 h-3 text-amber-400" />
          Credits
        </button>
      </div>

      {/* Right: Quick Poster Presets from User Attachments */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleLoadRaboskiPreset}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm transition-all"
          title="Instantly load the exact Italawa Royal Blue Torn-Paper Wondernitz Block layout"
        >
          <Sparkles className="w-3 h-3 text-yellow-300" />
          Wondernitz Poster
        </button>

        <button
          onClick={handleLoadSpotlightPreset}
          className="bg-[#242b3d] hover:bg-[#2d374d] text-blue-200 border border-blue-500/30 font-medium px-2.5 py-1 rounded-md flex items-center gap-1 transition-all"
          title="Instantly load the Studio Master Artist Spotlight & Mixer Sketch layout"
        >
          <User className="w-3 h-3 text-blue-400" />
          Artist Spotlight
        </button>
      </div>

      {/* Notification Toast */}
      {feedbackMsg && (
        <div className="w-full bg-blue-900/60 border border-blue-400/30 text-blue-200 px-3 py-1 rounded text-[11px] flex items-center gap-2 animate-fade-in">
          <Check className="w-3 h-3 text-blue-300 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Dropdown / Inline Editor for Song Metadata */}
      {showMetadataEditor && (
        <div className="w-full bg-[#161a24] border border-white/10 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-1 animate-fadeIn">
          <div>
            <label className="block text-gray-400 font-semibold mb-1">Track Title</label>
            <input
              type="text"
              value={songMeta.trackTitle}
              onChange={(e) => onUpdateConfig({
                songMetadata: { ...songMeta, trackTitle: e.target.value }
              })}
              className="w-full bg-[#0d1017] border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:border-blue-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-gray-400 font-semibold mb-1">Artist Name</label>
            <input
              type="text"
              value={songMeta.artistName}
              onChange={(e) => onUpdateConfig({
                songMetadata: { ...songMeta, artistName: e.target.value }
              })}
              className="w-full bg-[#0d1017] border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:border-blue-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-gray-400 font-semibold mb-1">Songwriters</label>
            <input
              type="text"
              value={songMeta.songwriters || ''}
              onChange={(e) => onUpdateConfig({
                songMetadata: { ...songMeta, songwriters: e.target.value }
              })}
              className="w-full bg-[#0d1017] border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-400 font-semibold mb-1">Producer(s)</label>
            <input
              type="text"
              value={songMeta.producers || ''}
              onChange={(e) => onUpdateConfig({
                songMetadata: { ...songMeta, producers: e.target.value }
              })}
              className="w-full bg-[#0d1017] border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-400 font-semibold mb-1">Release Date</label>
            <input
              type="text"
              value={songMeta.releaseDate || ''}
              onChange={(e) => onUpdateConfig({
                songMetadata: { ...songMeta, releaseDate: e.target.value }
              })}
              className="w-full bg-[#0d1017] border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-400 font-semibold mb-1">Tagline</label>
            <input
              type="text"
              value={songMeta.tagline || ''}
              onChange={(e) => onUpdateConfig({
                songMetadata: { ...songMeta, tagline: e.target.value }
              })}
              className="w-full bg-[#0d1017] border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-400 font-semibold mb-1">Track Number Badge</label>
            <input
              type="text"
              value={songMeta.trackNumber || '04 / 04'}
              onChange={(e) => onUpdateConfig({
                songMetadata: { ...songMeta, trackNumber: e.target.value }
              })}
              className="w-full bg-[#0d1017] border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setShowMetadataEditor(false)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-1 rounded transition-colors"
            >
              Done Editing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
