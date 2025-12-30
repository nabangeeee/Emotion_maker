/**
 * 결과 화면 - 생성된 이모티콘 확인 및 다운로드
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../App';
// 웹 환경에서는 폴리필 사용
let RNFS: any;
if (typeof window !== 'undefined') {
  RNFS = {
    DocumentDirectoryPath: '/',
    readdir: async (path: string) => {
      return [];
    },
  };
} else {
  RNFS = require('react-native-fs');
}

type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;

const ResultScreen: React.FC = () => {
  const route = useRoute<ResultScreenRouteProp>();
  const {emoticonSetId, generatedImages, selectedType} = route.params;

  const [displayImages, setDisplayImages] = useState<string[]>([]);
  const [emoticonType, setEmoticonType] = useState<string>('');

  useEffect(() => {
    // 생성된 이미지 로드
    if (generatedImages && selectedType) {
      const images = generatedImages[selectedType] || [];
      setDisplayImages(images);
      setEmoticonType(selectedType);
    }
  }, [generatedImages, selectedType]);

  const handleDownload = async (type: string) => {
    try {
      Alert.alert('다운로드', `${type} 이모티콘 세트를 다운로드합니다.`);
      // 실제 다운로드 로직 구현
    } catch (error) {
      Alert.alert('오류', '다운로드에 실패했습니다.');
    }
  };

  const handleShare = async (type: string) => {
    try {
      // 공유 기능 구현
      Alert.alert('공유', `${type} 이모티콘 세트를 공유합니다.`);
    } catch (error) {
      Alert.alert('오류', '공유에 실패했습니다.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>이모티콘 생성 완료!</Text>
        <Text style={styles.subtitle}>생성된 이모티콘을 확인하고 다운로드하세요</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          생성된 이모티콘 ({displayImages.length}개)
        </Text>
        
        {displayImages.length > 0 ? (
          <View style={styles.emoticonGrid}>
            {displayImages.map((imageUrl, index) => (
              <View key={index} style={styles.emoticonItem}>
                <Image
                  source={{uri: imageUrl}}
                  style={styles.emoticonImage}
                  resizeMode="contain"
                />
                <Text style={styles.emoticonNumber}>{index + 1}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>생성된 이모티콘이 없습니다.</Text>
          </View>
        )}
        
        {displayImages.length > 0 && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.downloadButton]}
              onPress={() => handleDownload(emoticonType)}>
              <Text style={styles.actionButtonText}>전체 다운로드</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={() => handleShare(emoticonType)}>
              <Text style={styles.actionButtonText}>공유</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>다음 단계</Text>
        <Text style={styles.infoText}>
          1. 생성된 이모티콘을 확인하세요{'\n'}
          2. 원하는 세트를 다운로드하세요{'\n'}
          3. 카카오톡 이모티콘 스튜디오에 업로드하세요
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
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  emoticonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  emoticonItem: {
    width: '23%',
    marginRight: '2%',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    position: 'relative',
  },
  emoticonImage: {
    width: '100%',
    height: 100,
    borderRadius: 4,
    backgroundColor: '#F0F0F0',
  },
  emoticonNumber: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  downloadButton: {
    backgroundColor: '#FEE500',
  },
  shareButton: {
    backgroundColor: '#E0E0E0',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
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

export default ResultScreen;

