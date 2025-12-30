/**
 * 로컬 스토리지 유틸리티
 */

// 웹 환경에서는 localStorage 사용
let AsyncStorage: any;
if (typeof window !== 'undefined') {
  // 웹 환경
  AsyncStorage = {
    setItem: async (key: string, value: string) => {
      localStorage.setItem(key, value);
    },
    getItem: async (key: string) => {
      return localStorage.getItem(key);
    },
  };
} else {
  // 네이티브 환경
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

const STORAGE_KEYS = {
  API_KEY: 'OPENAI_API_KEY',
  EMOTICON_SETS: 'EMOTICON_SETS',
  USER_PREFERENCES: 'USER_PREFERENCES',
};

export const storage = {
  /**
   * API 키 저장
   */
  async saveApiKey(apiKey: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
    } catch (error) {
      console.error('API 키 저장 오류:', error);
      throw error;
    }
  },

  /**
   * API 키 불러오기
   */
  async getApiKey(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
    } catch (error) {
      console.error('API 키 불러오기 오류:', error);
      return null;
    }
  },

  /**
   * 이모티콘 세트 저장
   */
  async saveEmoticonSet(setId: string, setData: any): Promise<void> {
    try {
      const existingSets = await this.getEmoticonSets();
      const updatedSets = {
        ...existingSets,
        [setId]: setData,
      };
      await AsyncStorage.setItem(
        STORAGE_KEYS.EMOTICON_SETS,
        JSON.stringify(updatedSets),
      );
    } catch (error) {
      console.error('이모티콘 세트 저장 오류:', error);
      throw error;
    }
  },

  /**
   * 이모티콘 세트 불러오기
   */
  async getEmoticonSets(): Promise<Record<string, any>> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.EMOTICON_SETS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('이모티콘 세트 불러오기 오류:', error);
      return {};
    }
  },

  /**
   * 사용자 설정 저장
   */
  async saveUserPreferences(preferences: any): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PREFERENCES,
        JSON.stringify(preferences),
      );
    } catch (error) {
      console.error('사용자 설정 저장 오류:', error);
      throw error;
    }
  },

  /**
   * 사용자 설정 불러오기
   */
  async getUserPreferences(): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('사용자 설정 불러오기 오류:', error);
      return {};
    }
  },
};

