/**
 * 카카오톡 이모티콘 타입 정의
 */

export enum EmoticonType {
  STILL = 'still', // 멈춰있는 이모티콘
  ANIMATED = 'animated', // 움직이는 이모티콘
  LARGE = 'large', // 큰 이모티콘
  STILL_MINI = 'still_mini', // 멈춰있는 미니 이모티콘
  ANIMATED_MINI = 'animated_mini', // 움직이는 미니 이모티콘
}

export interface EmoticonSetConfig {
  type: EmoticonType;
  totalCount: number;
  webpCount: number; // 움직이는 이모티콘의 경우 3개 이상
  pngCount: number;
  dimensions: {
    width: number;
    height: number;
  };
}

export const EMOTICON_CONFIGS: Record<EmoticonType, EmoticonSetConfig> = {
  [EmoticonType.STILL]: {
    type: EmoticonType.STILL,
    totalCount: 32,
    webpCount: 0,
    pngCount: 32,
    dimensions: {width: 360, height: 360}, // 일반 이모티콘 크기
  },
  [EmoticonType.ANIMATED]: {
    type: EmoticonType.ANIMATED,
    totalCount: 24,
    webpCount: 3, // 최소 3개 이상
    pngCount: 21,
    dimensions: {width: 360, height: 360},
  },
  [EmoticonType.LARGE]: {
    type: EmoticonType.LARGE,
    totalCount: 16,
    webpCount: 3, // 최소 3개 이상
    pngCount: 13,
    dimensions: {width: 720, height: 720}, // 큰 이모티콘 크기
  },
  [EmoticonType.STILL_MINI]: {
    type: EmoticonType.STILL_MINI,
    totalCount: 42,
    webpCount: 0,
    pngCount: 42,
    dimensions: {width: 120, height: 120}, // 미니 이모티콘 크기
  },
  [EmoticonType.ANIMATED_MINI]: {
    type: EmoticonType.ANIMATED_MINI,
    totalCount: 35,
    webpCount: 3, // 최소 3개 이상
    pngCount: 32,
    dimensions: {width: 120, height: 120},
  },
};

export interface GeneratedEmoticon {
  id: string;
  type: EmoticonType;
  imageUri: string;
  format: 'png' | 'webp';
  prompt: string;
  createdAt: Date;
}

export interface EmoticonGenerationRequest {
  prompt: string;
  characterDescription?: string; // 캐릭터 설명 (예: "밝은 갈색 곰 캐릭터")
  types: EmoticonType[]; // 생성할 이모티콘 타입들
}

export interface GenerationProgress {
  type: EmoticonType;
  current: number;
  total: number;
  status: 'pending' | 'generating' | 'completed' | 'error';
}

