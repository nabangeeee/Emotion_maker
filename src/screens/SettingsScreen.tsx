/**
 * 설정 화면 - API 키 입력
 */

import React, {useState, useEffect} from 'react';
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
import {storage} from '../utils/storage';
import aiService from '../services/aiService';

type SettingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Settings'
>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const savedKey = await storage.getApiKey();
      if (savedKey) {
        setApiKey(savedKey);
        aiService.setApiKey(savedKey);
      }
    } catch (error) {
      console.error('API 키 불러오기 오류:', error);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      Alert.alert('알림', 'API 키를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      await storage.saveApiKey(apiKey.trim());
      aiService.setApiKey(apiKey.trim());
      Alert.alert('성공', 'API 키가 저장되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('오류', 'API 키 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    Alert.alert('확인', '저장된 API 키를 삭제하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await storage.saveApiKey('');
            setApiKey('');
            aiService.setApiKey('');
            Alert.alert('완료', 'API 키가 삭제되었습니다.');
          } catch (error) {
            Alert.alert('오류', 'API 키 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.label}>Google Gemini API 키</Text>
        <Text style={styles.hint}>
          Google Gemini API 키를 입력하세요. API 키는 안전하게 저장됩니다.
        </Text>
        <Text style={styles.hint}>
          API 키는{' '}
          <Text
            style={styles.link}
            onPress={() => {
              if (typeof window !== 'undefined') {
                window.open('https://aistudio.google.com/apikey', '_blank');
              }
            }}>
            https://aistudio.google.com/apikey
          </Text>{' '}
          에서 발급받을 수 있습니다.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="AIza..."
          placeholderTextColor="#999"
          value={apiKey}
          onChangeText={setApiKey}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton, isLoading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isLoading}>
          <Text style={styles.buttonText}>저장</Text>
        </TouchableOpacity>

        {apiKey && (
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={handleClear}>
            <Text style={[styles.buttonText, styles.clearButtonText]}>삭제</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>API 키 사용 안내</Text>
        <Text style={styles.infoText}>
          • API 키는 로컬에만 저장되며 서버로 전송되지 않습니다.{'\n'}
          • Google Gemini API 사용 시 비용이 발생할 수 있습니다.{'\n'}
          • API 키는 이모티콘 생성에만 사용됩니다.{'\n'}
          • API 키를 잃어버리면 다시 입력해야 합니다.
        </Text>
      </View>
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
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  link: {
    color: '#0066CC',
    textDecorationLine: 'underline',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 8,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  button: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#FEE500',
  },
  clearButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  clearButtonText: {
    color: '#666',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});

export default SettingsScreen;

