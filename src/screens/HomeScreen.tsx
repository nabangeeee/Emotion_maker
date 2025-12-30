/**
 * 홈 화면 - 프롬프트 입력
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';
import {EmoticonType, EMOTICON_CONFIGS} from '../types/emoticon';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [prompt, setPrompt] = useState('');
  const [characterDescription, setCharacterDescription] = useState('');
  const [selectedType, setSelectedType] = useState<EmoticonType>(
    EmoticonType.STILL,
  );

  const selectType = (type: EmoticonType) => {
    setSelectedType(type);
  };

  const handleGenerate = () => {
    if (!prompt.trim()) {
      Alert.alert('알림', '프롬프트를 입력해주세요.');
      return;
    }

    if (!selectedType) {
      Alert.alert('알림', '이모티콘 타입을 선택해주세요.');
      return;
    }

    navigation.navigate('Generation', {
      prompt: prompt.trim(),
      characterDescription: characterDescription.trim() || undefined,
      types: [selectedType],
    });
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

  const getTypeInfo = (type: EmoticonType): string => {
    const config = EMOTICON_CONFIGS[type];
    if (config.webpCount > 0) {
      return `총 ${config.totalCount}개 | WEBP ${config.webpCount}개 이상 • 나머지 PNG`;
    }
    return `총 ${config.totalCount}개 | PNG ${config.pngCount}개`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => navigation.navigate('Settings')}>
        <Text style={styles.settingsButtonText}>⚙️ 설정</Text>
      </TouchableOpacity>
      <View style={styles.section}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>이모티콘 동작/상황 설명</Text>
          <TouchableOpacity
            style={styles.recommendButton}
            onPress={() => {
              const config = EMOTICON_CONFIGS[selectedType];
              // 테스트를 위해 최대 3개만 추천
              const maxCount = 3;
              const allActions = [
                '웃는 표정', '인사하는 모습', '슬픈 표정', '놀란 표정',
                '사랑하는 표정', '졸린 표정', '화난 표정', '부끄러워하는 모습',
                '춤추는 모습', '먹는 모습', '자는 모습', '공부하는 모습',
                '운동하는 모습', '노래하는 모습', '놀고 있는 모습',
                '하트 보내는 모습', '박수 치는 모습', '안녕 인사하는 모습',
                '고마워하는 모습', '미안해하는 모습', '축하하는 모습',
                '생일 축하하는 모습', '사과하는 모습', '좋아하는 모습',
                '싫어하는 모습', '응원하는 모습', '힘내는 모습',
                '잘했어하는 모습', '기대하는 모습', '설레는 모습',
                '당황하는 모습', '멍하니 있는 모습', '생각하는 모습',
                '고민하는 모습', '결정하는 모습', '승리하는 모습',
                '실망하는 모습', '놀라워하는 모습', '신나하는 모습',
                '피곤한 모습', '건강한 모습', '요리하는 모습',
                '청소하는 모습', '쇼핑하는 모습', '여행하는 모습',
                '독서하는 모습', '게임하는 모습', '영화보는 모습',
                '음악듣는 모습', '사진찍는 모습', '그림그리는 모습',
              ];
              const recommendedActions = allActions
                .slice(0, Math.min(config.totalCount, maxCount))
                .join(', ');
              setPrompt(recommendedActions);
            }}>
            <Text style={styles.recommendButtonText}>
              3개 동작 추천 (테스트)
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>
          이모티콘이 어떤 동작을 하거나 어떤 상황인지 설명해주세요
        </Text>
        <TextInput
          style={styles.input}
          placeholder="예: 다양한 표정을 짓는 모습, 인사하는 모습, 춤추는 모습 등"
          placeholderTextColor="#999"
          value={prompt}
          onChangeText={setPrompt}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>캐릭터 외형 설명 (선택사항)</Text>
        <Text style={styles.hint}>
          캐릭터의 모습을 자세히 설명해주세요. 비워두면 기본 캐릭터가 사용됩니다.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="예: 밝은 갈색 곰, 작은 눈, 둥근 얼굴, 파란색 고양이, 큰 눈 등"
          placeholderTextColor="#999"
          value={characterDescription}
          onChangeText={setCharacterDescription}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>이모티콘 타입 선택</Text>
        {Object.values(EmoticonType).map(type => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeCard,
              selectedType === type && styles.typeCardSelected,
            ]}
            onPress={() => selectType(type)}>
            <View style={styles.typeCardContent}>
              <Text
                style={[
                  styles.typeCardTitle,
                  selectedType === type && styles.typeCardTitleSelected,
                ]}>
                {getTypeLabel(type)}
              </Text>
              <Text
                style={[
                  styles.typeCardInfo,
                  selectedType === type && styles.typeCardInfoSelected,
                ]}>
                {getTypeInfo(type)}
              </Text>
            </View>
            <View
              style={[
                styles.checkbox,
                selectedType === type && styles.checkboxSelected,
              ]}>
              {selectedType === type && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, !prompt.trim() && styles.buttonDisabled]}
        onPress={handleGenerate}
        disabled={!prompt.trim()}>
        <Text style={styles.buttonText}>이모티콘 생성하기</Text>
      </TouchableOpacity>
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
  settingsButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 16,
  },
  settingsButtonText: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  recommendButton: {
    backgroundColor: '#FEE500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 12,
  },
  recommendButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  typeCardSelected: {
    borderColor: '#FEE500',
    backgroundColor: '#FFFEF0',
  },
  typeCardContent: {
    flex: 1,
  },
  typeCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  typeCardTitleSelected: {
    color: '#000',
  },
  typeCardInfo: {
    fontSize: 14,
    color: '#666',
  },
  typeCardInfoSelected: {
    color: '#333',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  checkboxSelected: {
    borderColor: '#FEE500',
    backgroundColor: '#FEE500',
  },
  checkmark: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#FEE500',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default HomeScreen;

