/**
 * 앱 상수 정의
 */

export const APP_CONFIG = {
  APP_NAME: '이모티콘 메이커',
  VERSION: '1.0.0',
};

export const AI_CONFIG = {
  DEFAULT_MODEL: 'imagen-3.0-generate-001',
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000, // ms
  BATCH_SIZE: 1, // Imagen은 한 번에 1개씩만 생성 (안정성을 위해)
};

export const EMOTICON_CONFIG = {
  MAX_PROMPT_LENGTH: 500,
  MIN_PROMPT_LENGTH: 10,
  DEFAULT_CHARACTER: '귀여운 밝은 갈색 곰 캐릭터',
};

export const COLORS = {
  PRIMARY: '#FEE500', // 카카오톡 노란색
  SECONDARY: '#000000',
  BACKGROUND: '#F5F5F5',
  WHITE: '#FFFFFF',
  GRAY: '#E0E0E0',
  DARK_GRAY: '#666666',
  TEXT: '#333333',
  ERROR: '#C62828',
};

