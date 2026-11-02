export type ModelCategory = 'llm' | 'video' | 'image';

export interface ModelConfig {
  id: string;
  name: string;
  provider: string; // 'Google' | 'OpenAI' | 'Anthropic' | 'Runway' | 'Midjourney' | 'Ollama' | 'Custom'
  category: ModelCategory;
  modelIdentifier: string; // e.g. 'gemini-3.8-flash', 'gpt-4o', 'gemini-omni-1.1-flash', 'runway-gen3'
  endpointUrl?: string;
  apiKey?: string;
  authHeaderType?: 'Bearer' | 'x-api-key' | 'Custom';
  customHeaderName?: string;
  isBuiltIn: boolean;
  isEnabled: boolean;
  description: string;
  badge?: string;
  parameters?: Record<string, any>;
  customPayloadTemplate?: string;
}

export interface PipelineConfig {
  // Remotion Pipeline Connection
  remotionEnabled: boolean;
  remotionServerUrl: string; // e.g. 'http://localhost:8000/render' or AWS Lambda endpoint
  remotionAuthToken: string;
  remotionConcurrency: number;
  remotionFps: number; // 30 or 60
  remotionCodec: 'h264' | 'h265' | 'vp8' | 'vp9' | 'prores';

  // Hyperframe Pipeline Connection
  hyperframeEnabled: boolean;
  hyperframeEndpointUrl: string; // e.g. 'https://api.hyperframe.io/v1/jobs'
  hyperframeApiKey: string;
  hyperframeWebhookSecret: string;
  hyperframeWorkerGroup: string;

  // Local Zero-LLM Engine Preferences
  localEnginePacingMode: 'smart_cadence' | 'fixed_interval' | 'speech_synchronized';
  localWordsPerSecond: number; // default ~2.5
  localCanvasFps: number; // 30 or 60
  localVideoBitrate: number; // in bps, default 6000000 (6Mbps)
}

export interface AppSettings {
  selectedLlmId: string;
  selectedVideoModelId: string;
  selectedImageModelId: string;
  models: ModelConfig[];
  pipeline: PipelineConfig;
}
