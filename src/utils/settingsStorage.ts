import { AppSettings, ModelConfig, PipelineConfig } from '../types/settings';

const SETTINGS_KEY = 'directorflow_studio_settings_v1';

export const INITIAL_MODELS: ModelConfig[] = [
  // LLMs / Script Models
  {
    id: 'llm-gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    provider: 'Google',
    category: 'llm',
    modelIdentifier: 'gemini-3.8-flash',
    isBuiltIn: true,
    isEnabled: true,
    description: 'Ultra-fast screenplay analysis, scene beat division, and pacing director.',
    badge: 'Recommended',
  },
  {
    id: 'llm-gemini-4-argon',
    name: 'Gemini 4 Argon',
    provider: 'Google',
    category: 'llm',
    modelIdentifier: 'gemini-4-argon',
    isBuiltIn: true,
    isEnabled: true,
    description: 'Complex narrative reasoning and deep screenplay structure.',
    badge: 'High Reasoning',
  },
  {
    id: 'llm-gpt-4o',
    name: 'ChatGPT (GPT-4o)',
    provider: 'OpenAI',
    category: 'llm',
    modelIdentifier: 'gpt-4o',
    endpointUrl: 'https://api.openai.com/v1/chat/completions',
    isBuiltIn: true,
    isEnabled: true,
    description: 'Popular multimodal flagship model for creative script doctoring.',
    badge: 'OpenAI',
  },
  {
    id: 'llm-claude-3.7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    category: 'llm',
    modelIdentifier: 'claude-3-7-sonnet-20250219',
    endpointUrl: 'https://api.anthropic.com/v1/messages',
    isBuiltIn: true,
    isEnabled: true,
    description: 'Nuanced character dialogue, tone consistency, and screenplay beats.',
    badge: 'Anthropic',
  },
  {
    id: 'llm-deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    category: 'llm',
    modelIdentifier: 'deepseek-reasoner',
    endpointUrl: 'https://api.deepseek.com/chat/completions',
    isBuiltIn: true,
    isEnabled: true,
    description: 'Advanced open-weight reasoning model for complex timing breakdown.',
  },
  {
    id: 'llm-ollama-local',
    name: 'Local Ollama / vLLM',
    provider: 'Local',
    category: 'llm',
    modelIdentifier: 'llama3:latest',
    endpointUrl: 'http://localhost:11434/api/generate',
    isBuiltIn: true,
    isEnabled: true,
    description: 'Fully local offline LLM endpoint running on your workstation.',
    badge: 'Local / Offline',
  },

  // Video Generation Models
  {
    id: 'vid-gemini-omni-flash',
    name: 'Gemini Omni Flash (Veo Lite)',
    provider: 'Google',
    category: 'video',
    modelIdentifier: 'gemini-omni-1.1-flash',
    isBuiltIn: true,
    isEnabled: true,
    description: 'Direct image-to-video, text-to-video, and continuous extension via Interactions API.',
    badge: 'Omni Flash',
  },
  {
    id: 'vid-veo-2',
    name: 'Google Veo 2 Flagship',
    provider: 'Google',
    category: 'video',
    modelIdentifier: 'veo-2.0-generate-preview',
    isBuiltIn: true,
    isEnabled: true,
    description: 'Next-generation high-definition 4K video synthesis with precise camera physics.',
    badge: 'Veo 2',
  },
  {
    id: 'vid-runway-gen3',
    name: 'Runway Gen-3 Alpha',
    provider: 'Runway',
    category: 'video',
    modelIdentifier: 'gen3a_turbo',
    endpointUrl: 'https://api.dev.runwayml.com/v1/image_to_video',
    isBuiltIn: true,
    isEnabled: true,
    description: 'Industry-standard cinematic motion and camera steering.',
    badge: 'Runway',
  },
  {
    id: 'vid-luma-dream',
    name: 'Luma Dream Machine',
    provider: 'Luma AI',
    category: 'video',
    modelIdentifier: 'ray-2',
    endpointUrl: 'https://api.lumalabs.ai/dream-machine/v1/generations',
    isBuiltIn: true,
    isEnabled: true,
    description: 'Ultra-smooth camera physics and hyper-realistic temporal consistency.',
    badge: 'Luma',
  },
  {
    id: 'vid-kling-ai',
    name: 'Kling 1.5 HD',
    provider: 'Kuaishou Kling',
    category: 'video',
    modelIdentifier: 'kling-v1-5',
    endpointUrl: 'https://api.klingai.com/v1/videos/image2video',
    isBuiltIn: true,
    isEnabled: true,
    description: 'High-speed cinematic motion synthesis up to 10 seconds per clip.',
    badge: 'Kling',
  },
  {
    id: 'vid-sora',
    name: 'OpenAI Sora',
    provider: 'OpenAI',
    category: 'video',
    modelIdentifier: 'sora-1.0',
    endpointUrl: 'https://api.openai.com/v1/videos/generations',
    isBuiltIn: true,
    isEnabled: true,
    description: 'Extended physical world simulation and photorealistic video synthesis.',
    badge: 'OpenAI',
  },

  // Image Generation Models
  {
    id: 'img-nano-banana',
    name: 'Nano Banana (Flash Lite Image)',
    provider: 'Google',
    category: 'image',
    modelIdentifier: 'gemini-3.1-flash-lite-image',
    isBuiltIn: true,
    isEnabled: true,
    description: 'Fast concept art and reference imagery generation.',
    badge: 'Google Fast',
  },
  {
    id: 'img-nano-banana-pro',
    name: 'Nano Banana 2.1 (Pro Image)',
    provider: 'Google',
    category: 'image',
    modelIdentifier: 'gemini-nano-banana-2.1',
    isBuiltIn: true,
    isEnabled: true,
    description: 'Studio-grade 2K/4K high-fidelity visual generation.',
    badge: 'Google 4K',
  },
  {
    id: 'img-dalle-3',
    name: 'ChatGPT / DALL-E 3',
    provider: 'OpenAI',
    category: 'image',
    modelIdentifier: 'dall-e-3',
    endpointUrl: 'https://api.openai.com/v1/images/generations',
    isBuiltIn: true,
    isEnabled: true,
    description: 'High prompt obedience and stylized visual storytelling.',
    badge: 'DALL-E 3',
  },
  {
    id: 'img-midjourney',
    name: 'Midjourney v6.1 API',
    provider: 'Midjourney',
    category: 'image',
    modelIdentifier: 'mj-v6.1',
    endpointUrl: 'https://api.midjourney.com/v1/imagine',
    isBuiltIn: true,
    isEnabled: true,
    description: 'Breathtaking cinematic aesthetics, photorealism, and artistic lighting.',
    badge: 'Midjourney',
  },
  {
    id: 'img-flux-pro',
    name: 'Flux.1 Pro',
    provider: 'Black Forest Labs',
    category: 'image',
    modelIdentifier: 'flux-pro',
    endpointUrl: 'https://api.bfl.ml/v1/flux-pro',
    isBuiltIn: true,
    isEnabled: true,
    description: 'State-of-the-art text rendering, human anatomy, and realism.',
    badge: 'Flux.1',
  },
];

export const INITIAL_PIPELINE: PipelineConfig = {
  remotionEnabled: true,
  remotionServerUrl: 'http://localhost:8000/render',
  remotionAuthToken: '',
  remotionConcurrency: 4,
  remotionFps: 30,
  remotionCodec: 'h264',

  hyperframeEnabled: true,
  hyperframeEndpointUrl: 'https://api.hyperframe.io/v1/jobs',
  hyperframeApiKey: '',
  hyperframeWebhookSecret: '',
  hyperframeWorkerGroup: 'default-cloud-gpu',

  localEnginePacingMode: 'smart_cadence',
  localWordsPerSecond: 2.5,
  localCanvasFps: 30,
  localVideoBitrate: 6000000,
};

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') {
    return {
      selectedLlmId: 'llm-gemini-3.8-flash',
      selectedVideoModelId: 'vid-gemini-omni-flash',
      selectedImageModelId: 'img-nano-banana-pro',
      models: INITIAL_MODELS,
      pipeline: INITIAL_PIPELINE,
    };
  }

  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      const initial: AppSettings = {
        selectedLlmId: 'llm-gemini-3.8-flash',
        selectedVideoModelId: 'vid-gemini-omni-flash',
        selectedImageModelId: 'img-nano-banana-pro',
        models: INITIAL_MODELS,
        pipeline: INITIAL_PIPELINE,
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return {
      selectedLlmId: parsed.selectedLlmId || 'llm-gemini-3.8-flash',
      selectedVideoModelId: parsed.selectedVideoModelId || 'vid-gemini-omni-flash',
      selectedImageModelId: parsed.selectedImageModelId || 'img-nano-banana-pro',
      models: Array.isArray(parsed.models) && parsed.models.length > 0 ? parsed.models : INITIAL_MODELS,
      pipeline: { ...INITIAL_PIPELINE, ...parsed.pipeline },
    };
  } catch (err) {
    return {
      selectedLlmId: 'llm-gemini-3.8-flash',
      selectedVideoModelId: 'vid-gemini-omni-flash',
      selectedImageModelId: 'img-nano-banana-pro',
      models: INITIAL_MODELS,
      pipeline: INITIAL_PIPELINE,
    };
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
}
