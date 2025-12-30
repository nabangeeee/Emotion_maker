import React from 'react';
import {createRoot} from 'react-dom/client';

// 웹 환경에서 필요한 폴리필
if (typeof global === 'undefined') {
  var global = globalThis;
}

// React Native Web은 CSS 파일이 필요 없습니다

// 에러 바운더리 추가
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false, error: null};
  }

  static getDerivedStateFromError(error) {
    return {hasError: true, error};
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: 20, color: 'red'}}>
          <h1>오류가 발생했습니다</h1>
          <pre>{this.state.error?.toString()}</pre>
          <button onClick={() => window.location.reload()}>새로고침</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// App을 동적으로 로드
let App;
try {
  App = require('./src/App').default;
} catch (error) {
  console.error('Failed to load App:', error);
  App = () => (
    <div style={{padding: 20}}>
      <h1>앱 로드 오류</h1>
      <pre>{error.toString()}</pre>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
  document.body.innerHTML = '<div style="padding: 20px; color: red;">Root element not found</div>';
}

