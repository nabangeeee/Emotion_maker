/**
 * 생성 화면 - 이모티콘 생성 진행 상황
 */

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../App';
import {EmoticonType, EMOTICON_CONFIGS, GenerationProgress} from '../types/emoticon';
import aiService from '../services/aiService';
import imageProcessor from '../services/imageProcessor';
// 웹 환경에서는 폴리필 사용
let RNFS: any;
if (typeof window !== 'undefined') {
  RNFS = {
    DocumentDirectoryPath: '/',
  };
} else {
  RNFS = require('react-native-fs');
}

// 웹 환경을 위한 간단한 Progress Bar 컴포넌트
const SimpleProgressBar: React.FC<{progress: number; [key: string]: any}> = ({
  progress,
  ...props
}) => (
  <View
    style={{
      height: props.height || 8,
      backgroundColor: props.unfilledColor || '#E0E0E0',
      borderRadius: props.borderRadius || 4,
      overflow: 'hidden',
    }}>
    <View
      style={{
        height: '100%',
        width: `${Math.max(0, Math.min(1, progress)) * 100}%`,
        backgroundColor: props.color || '#FEE500',
      }}
    />
  </View>
);

// react-native-progress를 동적으로 로드 (웹에서는 fallback 사용)
let Progress: any;
if (typeof window !== 'undefined') {
  // 웹 환경
  Progress = {
    Bar: SimpleProgressBar,
  };
} else {
  try {
    Progress = require('react-native-progress');
  } catch (e) {
    Progress = {
      Bar: SimpleProgressBar,
    };
  }
}

type GenerationScreenRouteProp = RouteProp<RootStackParamList, 'Generation'>;
type GenerationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Generation'
>;

const GenerationScreen: React.FC = () => {
  const route = useRoute<GenerationScreenRouteProp>();
  const navigation = useNavigation<GenerationScreenNavigationProp>();
  const {prompt, characterDescription, types} = route.params;

  const [progress, setProgress] = useState<Record<EmoticonType, GenerationProgress>>(
    {} as Record<EmoticonType, GenerationProgress>,
  );
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<
    Record<EmoticonType, string[]>
  >({} as Record<EmoticonType, string[]>);

  useEffect(() => {
    initializeProgress();
    startGeneration();
  }, []);

  const initializeProgress = () => {
    const initialProgress: Record<EmoticonType, GenerationProgress> = {} as Record<
      EmoticonType,
      GenerationProgress
    >;

    // 테스트를 위해 최대 3개만 생성
    const maxCount = 3;

    types.forEach(type => {
      const config = EMOTICON_CONFIGS[type as EmoticonType];
      initialProgress[type as EmoticonType] = {
        type: type as EmoticonType,
        current: 0,
        total: Math.min(config.totalCount, maxCount),
        status: 'pending',
      };
    });

    setProgress(initialProgress);
  };

  const startGeneration = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // API 키 확인 및 설정
      try {
        const {storage} = require('../utils/storage');
        const savedApiKey = await storage.getApiKey();
        console.log('API 키 확인:', savedApiKey ? '설정됨' : '설정 안됨');
        if (savedApiKey && savedApiKey.trim()) {
          aiService.setApiKey(savedApiKey.trim());
          console.log('API 키 설정 완료');
        } else {
          setError('API 키가 설정되지 않았습니다. 설정 화면에서 API 키를 입력해주세요.');
          setIsGenerating(false);
          return;
        }
      } catch (error) {
        console.error('API 키 로드 오류:', error);
        setError('API 키를 불러오는 중 오류가 발생했습니다.');
        setIsGenerating(false);
        return;
      }

      const allImages: Record<EmoticonType, string[]> = {} as Record<
        EmoticonType,
        string[]
      >;

      // 각 타입별로 순차 생성
      for (const type of types) {
        const emoticonType = type as EmoticonType;
        const config = EMOTICON_CONFIGS[emoticonType];

        // 진행 상황 업데이트
        setProgress(prev => ({
          ...prev,
          [emoticonType]: {
            ...prev[emoticonType],
            status: 'generating',
          },
        }));

        try {
          // AI 이미지 생성 (진행 상황 업데이트 포함)
          // 테스트를 위해 최대 3개만 생성
          const maxCount = 3;
          const imageUrls: string[] = [];
          
          // 각 이미지를 하나씩 생성하면서 진행 상황 업데이트
          for (let i = 0; i < Math.min(config.totalCount, maxCount); i++) {
            try {
              const promptForImage = aiService.generateEmoticonPrompt(
                prompt,
                emoticonType,
                i,
                characterDescription,
              );

              console.log(`이미지 ${i + 1} 생성 시작...`, {
                type: emoticonType,
                promptLength: promptForImage.length,
              });

              // DALL-E 3는 1024x1024만 지원하므로 항상 1024로 요청
              // 실제 크기는 나중에 리사이즈
              const images = await aiService.generateImage({
                prompt: promptForImage,
                width: 1024, // DALL-E 3는 1024x1024만 지원
                height: 1024,
                n: 1,
              });

              console.log(`이미지 ${i + 1} 생성 응답:`, images);

              if (images && images.length > 0 && images[0].imageUrl) {
                imageUrls.push(images[0].imageUrl);
                console.log(`이미지 ${i + 1} URL 추가됨:`, images[0].imageUrl);
              } else {
                console.warn(`이미지 ${i + 1}: 응답에 이미지 URL이 없습니다.`, images);
              }

              // 진행 상황 업데이트
              setProgress(prev => ({
                ...prev,
                [emoticonType]: {
                  ...prev[emoticonType],
                  current: i + 1,
                  status: 'generating',
                },
              }));

              // API rate limit 방지를 위한 딜레이 (마지막 이미지 제외)
              const actualCount = Math.min(config.totalCount, maxCount);
              if (i < actualCount - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            } catch (imgError: any) {
              console.error(`이미지 ${i + 1} 생성 오류:`, imgError);
              const errorMsg = imgError.message || imgError.toString();
              setError(prev => {
                const newError = `${emoticonType} - 이미지 ${i + 1}: ${errorMsg}`;
                return prev ? `${prev}\n${newError}` : newError;
              });
              // 개별 이미지 오류는 계속 진행하되 에러 메시지 표시
            }
          }

          console.log(`${emoticonType} 생성 완료: ${imageUrls.length}개 이미지`);

          if (imageUrls.length > 0) {
            allImages[emoticonType] = imageUrls;
            console.log(`${emoticonType}: ${imageUrls.length}개 이미지 생성 성공`, imageUrls);

            // 이미지 처리 (다운로드 및 리사이즈) - 웹에서는 스킵
            if (typeof window === 'undefined') {
              const outputDir = `${RNFS.DocumentDirectoryPath}/emoticons/${emoticonType}`;
              await imageProcessor.processEmoticonSet(
                imageUrls,
                emoticonType,
                outputDir,
              );
            }

            // 진행 상황 완료
            setProgress(prev => ({
              ...prev,
              [emoticonType]: {
                ...prev[emoticonType],
                current: imageUrls.length,
                status: 'completed',
              },
            }));
          } else {
            const errorMsg = `${emoticonType}: 이미지가 생성되지 않았습니다. API 키와 프롬프트를 확인해주세요.`;
            console.error(errorMsg);
            setError(prev => prev ? `${prev}\n${errorMsg}` : errorMsg);
            throw new Error(errorMsg);
          }
        } catch (err: any) {
          console.error(`이모티콘 타입 ${emoticonType} 생성 오류:`, err);
          const errorMessage = err.message || err.response?.data?.error?.message || '이미지 생성에 실패했습니다.';
          const fullError = `${emoticonType}: ${errorMessage}`;
          setError(prev => 
            prev ? `${prev}\n${fullError}` : fullError
          );
          setProgress(prev => ({
            ...prev,
            [emoticonType]: {
              ...prev[emoticonType],
              status: 'error',
            },
          }));
        }
      }

      console.log('전체 생성 결과:', {
        allImagesKeys: Object.keys(allImages),
        allImagesCount: Object.values(allImages).reduce((sum, arr) => sum + arr.length, 0),
        allImages,
      });

      setGeneratedImages(allImages);
      setIsGenerating(false);

      // 생성 완료 후 결과 화면으로 이동
      // 생성된 이미지들을 전달
      const firstType = types[0] as EmoticonType;
      const hasImages = Object.keys(allImages).length > 0 && 
                       allImages[firstType] && 
                       allImages[firstType].length > 0;

      console.log('이미지 확인:', {
        hasImages,
        firstType,
        imageCount: allImages[firstType]?.length,
        allImagesKeys: Object.keys(allImages),
      });

      if (hasImages) {
        console.log('결과 화면으로 이동합니다.');
        setTimeout(() => {
          navigation.replace('Result', {
            emoticonSetId: `set_${Date.now()}`,
            generatedImages: allImages,
            selectedType: firstType,
          });
        }, 1000);
      } else {
        const errorMsg = `이미지가 생성되지 않았습니다. (생성된 이미지: ${Object.values(allImages).reduce((sum, arr) => sum + arr.length, 0)}개) API 키와 프롬프트를 확인해주세요. 브라우저 콘솔(F12)에서 자세한 오류를 확인하세요.`;
        console.error('이미지 생성 실패:', errorMsg);
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error('생성 오류:', err);
      setError(err.message || '이모티콘 생성에 실패했습니다.');
      setIsGenerating(false);
    }
  };

  const getTypeLabel = (type: EmoticonType): string => {
    const labels: Record<EmoticonType, string> = {
      [EmoticonType.STILL]: '멈춰있는 이모티콘',
      [EmoticonType.ANIMATED]: '움직이는 이모티콘',
      [EmoticonType.LARGE]: '큰 이모티콘',
      [EmoticonType.STILL_MINI]: '멈춰있는 미니 이모티콘',
      [EmoticonType.ANIMATED_MINI]: '움직이는 미니 이모티콘',
    };
    return labels[type];
  };

  const getStatusText = (status: GenerationProgress['status']): string => {
    switch (status) {
      case 'pending':
        return '대기 중';
      case 'generating':
        return '생성 중';
      case 'completed':
        return '완료';
      case 'error':
        return '오류';
      default:
        return '';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>이모티콘 생성 중...</Text>
        <Text style={styles.subtitle}>잠시만 기다려주세요</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>오류 발생</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              startGeneration();
            }}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsLinkButton}
            onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.settingsLinkText}>설정 화면으로 이동</Text>
          </TouchableOpacity>
        </View>
      )}

      {types.map(type => {
        const emoticonType = type as EmoticonType;
        const prog = progress[emoticonType];
        if (!prog) return null;

        const progressValue = prog.total > 0 ? prog.current / prog.total : 0;

        return (
          <View key={type} style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>{getTypeLabel(emoticonType)}</Text>
              <Text style={styles.progressStatus}>{getStatusText(prog.status)}</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <Progress.Bar
                progress={progressValue}
                width={null}
                height={8}
                color="#FEE500"
                unfilledColor="#E0E0E0"
                borderWidth={0}
                borderRadius={4}
              />
            </View>
            <Text style={styles.progressText}>
              {prog.current} / {prog.total}
            </Text>
          </View>
        );
      })}

      {isGenerating && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FEE500" />
          <Text style={styles.loadingText}>AI가 이모티콘을 그리고 있습니다...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  errorTitle: {
    color: '#C62828',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#FEE500',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  retryButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  settingsLinkButton: {
    padding: 8,
    alignItems: 'center',
  },
  settingsLinkText: {
    color: '#0066CC',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressStatus: {
    fontSize: 14,
    color: '#666',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default GenerationScreen;

