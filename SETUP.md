# 프로젝트 설정 가이드

## 초기 설정

### 1. React Native 프로젝트 초기화

이 프로젝트는 React Native 프로젝트의 기본 구조만 포함되어 있습니다. 
실제 네이티브 코드를 포함한 완전한 프로젝트를 만들려면 다음 단계를 따르세요:

```bash
# React Native CLI 설치 (아직 설치하지 않은 경우)
npm install -g react-native-cli

# 또는 npx를 사용하여 새 프로젝트 생성
npx react-native init EmoticonMaker --template react-native-template-typescript

# 생성된 프로젝트에 이 프로젝트의 src 폴더 내용을 복사
```

### 2. 의존성 설치

```bash
npm install
# 또는
yarn install
```

### 3. iOS 설정

```bash
cd ios
pod install
cd ..
```

### 4. Android 설정

Android Studio를 열고 프로젝트를 동기화하세요.

## 추가 라이브러리 설치

다음 라이브러리들이 필요할 수 있습니다:

### 이미지 리사이즈 및 변환

```bash
npm install react-native-image-resizer
# 또는
npm install react-native-image-manipulator
```

### 환경 변수 관리

```bash
npm install react-native-config
```

### 파일 공유

```bash
npm install react-native-share
```

## 네이티브 모듈 링크

일부 라이브러리는 네이티브 링크가 필요합니다:

```bash
# iOS
cd ios && pod install && cd ..

# Android는 자동으로 링크됩니다 (React Native 0.60+)
```

## API 키 설정

### 방법 1: 환경 변수 사용

1. `react-native-config` 설치
2. `.env` 파일 생성:

```
OPENAI_API_KEY=your_api_key_here
```

3. 코드에서 사용:

```typescript
import Config from 'react-native-config';
const apiKey = Config.OPENAI_API_KEY;
```

### 방법 2: 앱 내 설정

앱 내에서 사용자가 API 키를 입력할 수 있는 설정 화면을 추가하세요.

## 빌드 및 실행

### iOS

```bash
npm run ios
```

또는 Xcode에서 직접 실행:

```bash
cd ios
open EmoticonMaker.xcworkspace
```

### Android

```bash
npm run android
```

또는 Android Studio에서 직접 실행.

## 문제 해결

### Metro Bundler 오류

```bash
npm start -- --reset-cache
```

### iOS Pod 설치 오류

```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### Android 빌드 오류

1. `android/gradle.properties` 확인
2. `android/build.gradle` 확인
3. Android SDK 버전 확인

## 다음 단계

1. **이미지 처리 라이브러리 통합**: 
   - `react-native-image-resizer` 또는 네이티브 모듈로 이미지 리사이즈 및 포맷 변환 구현

2. **애니메이션 생성**: 
   - 움직이는 이모티콘을 위한 프레임 애니메이션 생성 로직 추가

3. **API 키 관리 화면**: 
   - 사용자가 API 키를 입력하고 저장할 수 있는 설정 화면 추가

4. **이미지 최적화**: 
   - 파일 크기 최적화 및 품질 조정 기능

5. **배치 다운로드**: 
   - ZIP 파일로 압축하여 다운로드하는 기능

6. **테스트**: 
   - 단위 테스트 및 통합 테스트 작성

