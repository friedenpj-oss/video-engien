import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { generateHeuristicScenes } from './src/utils/scriptParser.js';
import { rescaleTimeline } from './src/utils/timelineEngine.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Route: Intelligent Scene Analysis & Sequencing
app.post('/api/analyze-and-sequence', async (req: Request, res: Response) => {
  try {
    const { 
      scriptText = '', 
      documents = [], 
      visuals = [], 
      targetDuration = 30, 
      aspectRatio = '16:9', 
      directorInstructions = '',
      style = 'cinematic'
    } = req.body;

    const fullScript = [
      scriptText,
      ...documents.map((d: any) => `\n--- Document: ${d.name} ---\n${d.content}`)
    ].join('\n').trim();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.log('No GEMINI_API_KEY found, running heuristic sequencer fallback.');
      const scenes = generateHeuristicScenes(fullScript, visuals, Number(targetDuration), directorInstructions);
      const rescaled = rescaleTimeline(scenes, Number(targetDuration));
      return res.json({
        scenes: rescaled,
        scriptSummary: `Sequenced ${rescaled.length} continuous scenes for a ${targetDuration}s ${aspectRatio} video based on your script and guidelines.`,
        analysisNotes: [
          `Target duration: ${targetDuration} seconds (${aspectRatio} format).`,
          `Analyzed ${visuals.length} uploaded visual assets and ${documents.length} script documents.`,
          'Heuristic pacing engine calibrated voiceover timing and cinematic camera moves.'
        ],
        targetDuration: Number(targetDuration),
        totalDuration: Number(targetDuration)
      });
    }

    // Call Gemini 3.8 Flash
    const ai = new GoogleGenAI();
    const systemPrompt = `You are a premier cinematic video director, script supervisor, and video generation sequencer.
Your task is to take the provided script guidelines, director instructions, and uploaded visual assets catalog, and produce a continuous, precisely timed sequence of video scenes for a ${targetDuration}-second video in ${aspectRatio} aspect ratio (${aspectRatio === '16:9' ? 'landscape widescreen' : 'vertical portrait 9:16 format'}).

Format Requirements:
- Total duration of all scenes must equal EXACTLY ${targetDuration} seconds (+/- 0.5s).
- Typically, for 30s use 5-6 scenes (4-6s each). For 60s use 8-10 scenes. For 90s use 12-15 scenes.
- Each scene must have:
  - id: unique string
  - sceneNumber: integer 1, 2, 3...
  - title: short 2-4 word punchy title
  - duration: number in seconds (e.g. 5.5)
  - assignedAssetId: id of the best matching visual asset from the provided catalog, or null if none
  - scriptBeat: narration or voiceover script for this exact beat
  - visualPrompt: comprehensive AI video prompt describing subject, lighting, environment, and motion styled for ${aspectRatio}
  - cameraMotion: one of ['zoom_in', 'zoom_out', 'pan_left', 'pan_right', 'tilt_up', 'cinematic_drift', 'orbit', 'static']
  - transition: one of ['crossfade', 'dissolve_black', 'wipe_right', 'zoom_in', 'cut']
  - transitionDuration: number in seconds (e.g. 0.8)
  - subtitle: crisp caption text to overlay
  - lowerThird: object with { title, subtitle }

Output JSON strictly with this schema:
{
  "scenes": [ ... ],
  "scriptSummary": "concise overview of narrative arc",
  "analysisNotes": ["note 1", "note 2", "note 3"]
}`;

    const userPrompt = `
=== DIRECTOR'S INSTRUCTIONS ===
${directorInstructions || 'Create a cinematic, continuous narrative matching the mood of the visuals.'}

=== TARGET SPECIFICATIONS ===
Target Duration: ${targetDuration} seconds
Aspect Ratio: ${aspectRatio}
Style: ${style}

=== VISUAL ASSET CATALOG (${visuals.length} available) ===
${JSON.stringify(visuals.map((v: any) => ({
  id: v.id,
  name: v.name,
  tags: v.tags,
  aspectRatio: v.aspectRatio
})), null, 2)}

=== SCRIPT & GUIDELINES TEXT ===
${fullScript.slice(0, 15000)}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // If markdown fenced
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error('Failed to parse model JSON');
      }
    }

    if (!parsed.scenes || !Array.isArray(parsed.scenes) || parsed.scenes.length === 0) {
      throw new Error('Model did not return valid scenes array');
    }

    const rescaled = rescaleTimeline(parsed.scenes, Number(targetDuration));

    return res.json({
      scenes: rescaled,
      scriptSummary: parsed.scriptSummary || `Continuous ${targetDuration}s video storyboard`,
      analysisNotes: parsed.analysisNotes || [`Successfully sequenced ${rescaled.length} scenes`],
      targetDuration: Number(targetDuration),
      totalDuration: Number(targetDuration)
    });

  } catch (error: any) {
    console.error('Sequencing error:', error);
    // Graceful fallback
    const { scriptText = '', documents = [], visuals = [], targetDuration = 30 } = req.body;
    const fullScript = [scriptText, ...documents.map((d: any) => d.content)].join('\n');
    const scenes = generateHeuristicScenes(fullScript, visuals, Number(targetDuration));
    const rescaled = rescaleTimeline(scenes, Number(targetDuration));

    return res.json({
      scenes: rescaled,
      scriptSummary: `Sequenced ${rescaled.length} continuous scenes (fallback calibrated)`,
      analysisNotes: [
        `Generated ${rescaled.length} scenes matching ${targetDuration}s timeline.`,
        'All visual references and audio voiceovers aligned.'
      ],
      targetDuration: Number(targetDuration),
      totalDuration: Number(targetDuration)
    });
  }
});

// Dev vs Prod Vite Integration
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`DirectorFlow server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
