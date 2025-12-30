/**
 * 이미지 처리 서비스
 * 이미지 크기 조정, 포맷 변환 등
 */

// 웹 환경에서는 폴리필 사용
let RNFS: any;
if (typeof window !== 'undefined') {
  // 웹 환경
  RNFS = {
    DocumentDirectoryPath: '/',
    downloadFile: async (options: any) => {
      return {
        promise: Promise.resolve({statusCode: 200}),
      };
    },
    exists: async (path: string) => {
      return false;
    },
    mkdir: async (path: string) => {
      return;
    },
    readdir: async (path: string) => {
      return [];
    },
  };
} else {
  // 네이티브 환경
  RNFS = require('react-native-fs');
}

import {EmoticonType, EMOTICON_CONFIGS} from '../types/emoticon';

export interface ImageProcessOptions {
  sourceUri: string;
  targetPath: string;
  width: number;
  height: number;
  format: 'png' | 'webp';
  quality?: number;
}

class ImageProcessor {
  /**
   * 이미지 다운로드
   */
  async downloadImage(url: string, targetPath: string): Promise<string> {
    try {
      const downloadResult = await RNFS.downloadFile({
        fromUrl: url,
        toFile: targetPath,
      }).promise;

      if (downloadResult.statusCode === 200) {
        return targetPath;
      } else {
        throw new Error(`다운로드 실패: ${downloadResult.statusCode}`);
      }
    } catch (error) {
      console.error('이미지 다운로드 오류:', error);
      throw error;
    }
  }

  /**
   * 이미지 리사이즈 및 포맷 변환
   * React Native에서는 네이티브 모듈이 필요할 수 있습니다
   */
  async processImage(options: ImageProcessOptions): Promise<string> {
    const {sourceUri, targetPath, width, height, format} = options;

    // 먼저 이미지 다운로드
    const downloadedPath = await this.downloadImage(sourceUri, targetPath);

    // 실제 리사이즈 및 포맷 변환은 네이티브 모듈 필요
    // react-native-image-resizer 같은 라이브러리 사용 권장
    // 여기서는 기본 구조만 제공

    return downloadedPath;
  }

  /**
   * 이모티콘 세트용 이미지 처리
   */
  async processEmoticonSet(
    imageUrls: string[],
    type: EmoticonType,
    outputDir: string,
  ): Promise<string[]> {
    const config = EMOTICON_CONFIGS[type];
    const processedPaths: string[] = [];

    // 출력 디렉토리 생성
    if (!(await RNFS.exists(outputDir))) {
      await RNFS.mkdir(outputDir);
    }

    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      const isWebp = type === EmoticonType.ANIMATED ||
        type === EmoticonType.ANIMATED_MINI ||
        type === EmoticonType.LARGE
          ? i < config.webpCount
          : false;

      const format = isWebp ? 'webp' : 'png';
      const fileName = `${type}_${i + 1}.${format}`;
      const targetPath = `${outputDir}/${fileName}`;

      const processedPath = await this.processImage({
        sourceUri: url,
        targetPath,
        width: config.dimensions.width,
        height: config.dimensions.height,
        format,
        quality: isWebp ? 90 : 100,
      });

      processedPaths.push(processedPath);
    }

    return processedPaths;
  }

  /**
   * 이미지 메타데이터 검증
   */
  async validateImage(
    imagePath: string,
    expectedWidth: number,
    expectedHeight: number,
  ): Promise<boolean> {
    // 실제 구현은 이미지 라이브러리 필요
    // 여기서는 기본 구조만 제공
    return true;
  }
}

export default new ImageProcessor();

