/**
 * 웹 환경을 위한 폴리필
 */

// react-native-fs 대체
export const RNFS = {
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

// react-native-share 대체
export const Share = {
  open: async (options: any) => {
    if (navigator.share) {
      await navigator.share({
        title: options.title,
        text: options.message,
        url: options.url,
      });
    } else {
      console.log('Share:', options);
    }
  },
};

