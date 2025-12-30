/**
 * 메인 앱 컴포넌트
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import HomeScreen from './screens/HomeScreen';
import GenerationScreen from './screens/GenerationScreen';
import ResultScreen from './screens/ResultScreen';

export type RootStackParamList = {
  Home: undefined;
  Generation: {
    prompt: string;
    characterDescription?: string;
    types: string[];
  };
  Result: {
    emoticonSetId: string;
  };
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#FEE500', // 카카오톡 노란색
            },
            headerTintColor: '#000000',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{title: '이모티콘 메이커'}}
          />
          <Stack.Screen
            name="Generation"
            component={GenerationScreen}
            options={{title: '이모티콘 생성 중'}}
          />
          <Stack.Screen
            name="Result"
            component={ResultScreen}
            options={{title: '생성 완료'}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;

