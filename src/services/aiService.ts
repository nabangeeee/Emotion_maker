/**
 * AI 이미지 생성 서비스
 * Google Gemini API를 사용한 이미지 생성
 */

import axios from 'axios';
import {EmoticonType, EMOTICON_CONFIGS} from '../types/emoticon';


export interface AIImageGenerationOptions {
  prompt: string;
  width: number;
  height: number;
  n?: number; // Gemini API는 한 번에 이미지 하나만 생성 (호환성을 위해 유지)
}

export interface AIImageResponse {
  imageUrl: string;
  revisedPrompt?: string;
}

class AIService {
  private apiKey: string | null = null;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta'; // Google Gemini API

  /**
   * API 키 설정
   */
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * width x height를 aspectRatio로 변환
   * Gemini API 문서의 표준 비율 사용
   */
  private getAspectRatio(width: number, height: number): string {
    const ratio = width / height;
    
    // 표준 비율 매핑 (문서 기준)
    if (Math.abs(ratio - 1) < 0.1) return '1:1';
    if (Math.abs(ratio - 2/3) < 0.1) return '2:3';
    if (Math.abs(ratio - 3/2) < 0.1) return '3:2';
    if (Math.abs(ratio - 3/4) < 0.1) return '3:4';
    if (Math.abs(ratio - 4/3) < 0.1) return '4:3';
    if (Math.abs(ratio - 4/5) < 0.1) return '4:5';
    if (Math.abs(ratio - 5/4) < 0.1) return '5:4';
    if (Math.abs(ratio - 9/16) < 0.1) return '9:16';
    if (Math.abs(ratio - 16/9) < 0.1) return '16:9';
    if (Math.abs(ratio - 21/9) < 0.1) return '21:9';
    
    // 기본값: 1:1 (정사각형)
    return '1:1';
  }

  /**
   * 이미지 생성
   * Google Gemini API 사용
   */
  async generateImage(
    options: AIImageGenerationOptions,
  ): Promise<AIImageResponse[]> {
    if (!this.apiKey) {
      throw new Error('API 키가 설정되지 않았습니다.');
    }

    const modelName = 'gemini-2.5-flash-image';
    const aspectRatio = this.getAspectRatio(options.width, options.height);

    console.log('이미지 생성 요청:', {
      model: modelName,
      aspectRatio: aspectRatio,
      promptLength: options.prompt.length,
      hasApiKey: !!this.apiKey,
    });

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${modelName}:generateContent`,
        {
          contents: [{
            parts: [
              {text: options.prompt}
            ]
          }],
          generationConfig: {
            imageConfig: {
              aspectRatio: aspectRatio
            }
          }
        },
        {
          headers: {
            'x-goog-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.data || !response.data.candidates || response.data.candidates.length === 0) {
        throw new Error('API 응답이 없습니다.');
      }

      const candidate = response.data.candidates[0];
      if (!candidate.content || !candidate.content.parts) {
        throw new Error('API 응답에 콘텐츠가 없습니다.');
      }

      const images: AIImageResponse[] = [];
      
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          // Base64 이미지를 data URL로 변환
          const imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          images.push({
            imageUrl: imageUrl,
            revisedPrompt: options.prompt,
          });
        }
      }

      if (images.length === 0) {
        console.error('API 응답 데이터:', response.data);
        throw new Error('API 응답에 이미지 데이터가 없습니다.');
      }

      console.log('생성된 이미지 개수:', images.length);
      return images;
    } catch (error: any) {
      console.error('AI 이미지 생성 오류:', error);
      console.error('오류 상세:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      let errorMessage = '이미지 생성에 실패했습니다.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error.message || errorMessage;
        if (error.response.data.error.code) {
          errorMessage = `[${error.response.data.error.code}] ${errorMessage}`;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * 이모티콘 프롬프트 생성
   * 카카오톡 이모티콘 스타일에 맞춘 프롬프트 생성
   * public으로 변경하여 외부에서 사용 가능하도록
   */
  generateEmoticonPrompt(
    basePrompt: string,
    type: EmoticonType,
    index: number,
    characterDescription?: string,
  ): string {
    const config = EMOTICON_CONFIGS[type];
    const isMini = type === EmoticonType.STILL_MINI || type === EmoticonType.ANIMATED_MINI;
    const isAnimated = type === EmoticonType.ANIMATED || type === EmoticonType.ANIMATED_MINI;

    // 기본 캐릭터 설명
    const character = characterDescription || '귀여운 밝은 갈색 곰 캐릭터';

    // 이모티콘 액션/표정 프롬프트 (충분한 개수 확보)
    const allActions = [
      '웃는 표정',
      '인사하는 모습',
      '슬픈 표정',
      '놀란 표정',
      '사랑하는 표정',
      '졸린 표정',
      '화난 표정',
      '부끄러워하는 모습',
      '춤추는 모습',
      '먹는 모습',
      '자는 모습',
      '공부하는 모습',
      '운동하는 모습',
      '노래하는 모습',
      '놀고 있는 모습',
      '하트 보내는 모습',
      '박수 치는 모습',
      '안녕 인사하는 모습',
      '고마워하는 모습',
      '미안해하는 모습',
      '축하하는 모습',
      '생일 축하하는 모습',
      '사과하는 모습',
      '좋아하는 모습',
      '싫어하는 모습',
      '응원하는 모습',
      '힘내는 모습',
      '잘했어하는 모습',
      '기대하는 모습',
      '설레는 모습',
      '당황하는 모습',
      '멍하니 있는 모습',
      '생각하는 모습',
      '고민하는 모습',
      '결정하는 모습',
      '승리하는 모습',
      '실망하는 모습',
      '놀라워하는 모습',
      '신나하는 모습',
      '피곤한 모습',
      '건강한 모습',
      '운동하는 모습',
      '요리하는 모습',
      '청소하는 모습',
      '쇼핑하는 모습',
      '여행하는 모습',
      '독서하는 모습',
      '게임하는 모습',
      '영화보는 모습',
      '음악듣는 모습',
      '사진찍는 모습',
      '그림그리는 모습',
    ];

    // 이모티콘 타입별 개수에 맞게 동작 선택
    const totalCount = config.totalCount;
    const actions = allActions.slice(0, Math.max(totalCount, allActions.length));
    const action = actions[index % actions.length];

    // 프롬프트 구성 (맨 아래 함수 사용)
    return buildPrompt(character, action, basePrompt, isMini, type, isAnimated);
  }

  /**
   * 배치 이미지 생성
   */
  async generateBatch(
    basePrompt: string,
    type: EmoticonType,
    count: number,
    characterDescription?: string,
  ): Promise<AIImageResponse[]> {
    const config = EMOTICON_CONFIGS[type];
    const results: AIImageResponse[] = [];

    // Gemini API는 한 번에 이미지 하나만 생성 가능
    const batchSize = 1;
    const batches = Math.ceil(count / batchSize);

    for (let i = 0; i < batches; i++) {
      const remaining = count - results.length;
      const currentBatchSize = Math.min(batchSize, remaining);

      for (let j = 0; j < currentBatchSize; j++) {
        const index = i * batchSize + j;
        const prompt = this.generateEmoticonPrompt(
          basePrompt,
          type,
          index,
          characterDescription,
        );

        const images = await this.generateImage({
          prompt,
          width: config.dimensions.width,
          height: config.dimensions.height,
          n: 1,
        });

        results.push(...images);

        // API rate limit 방지를 위한 딜레이
        if (i < batches - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    return results;
  }
}

export default new AIService();




/**
 * 프롬프트 구성 함수
 */
function buildPrompt(
  character: string,
  action: string,
  basePrompt: string,
  isMini: boolean,
  type: EmoticonType,
  isAnimated: boolean,
): string {
  // 1. 캐릭터 + 동작 + 사용자 프롬프트
  const contentPrompt = buildContentPrompt(character, action, basePrompt);

  // 2. 스타일 프롬프트
  const stylePrompt = buildStylePrompt(isMini, type, isAnimated);

  // 3. 시스템 프롬프트
  const systemPrompt = getSystemPrompt();

  // 최종 프롬프트: 제약을 맨 앞에 배치하여 강조
  const prompt = `${systemPrompt}. ${contentPrompt}. ${stylePrompt}.`
    .replace(/\s+/g, ' ') // 연속된 공백 제거
    .replace(/\.\s*\./g, '.') // 연속된 마침표 제거
    .trim();

  return prompt;
}

// ============================================
// 프롬프트 작성 부분 (여기서 수정하세요)
// ============================================

/**
 * 콘텐츠 프롬프트 작성
 */
function buildContentPrompt(character: string, action: string, basePrompt: string): string {
  return `A single isolated ${character} ${action}. ${basePrompt}`;
}

/**
 * 스타일 프롬프트 작성
 */
function buildStylePrompt(isMini: boolean, type: EmoticonType, isAnimated: boolean): string {
  let stylePrompt = '';
  if (isMini) {
    stylePrompt = '미니 이모티콘 스타일';
  } else if (type === EmoticonType.LARGE) {
    stylePrompt = '큰 이모티콘 스타일';
  }
  if (isAnimated) {
    stylePrompt += stylePrompt ? ', 애니메이션 가능한 디자인' : '애니메이션 가능한 디자인';
  }
  return stylePrompt;
}

/**
 * 시스템 프롬프트 작성
 * 여기서 프롬프트를 수정하세요
 */
function getSystemPrompt(): string {
  const SYSTEM_PROMPT = `
IMPORTANT: Create exactly ONE single emoticon character. Only ONE. Not multiple. Not a grid. Not an array. Not a collection. 
The image must contain ONLY ONE isolated character centered on transparent background. 
KakaoTalk emoticon style. High quality illustration. Square format. 
DO NOT include multiple emoticons, DO NOT create a grid layout, DO NOT show multiple characters.
`.trim();

  return SYSTEM_PROMPT;
}
