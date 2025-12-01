import React, { useEffect, useState } from 'react';
import DanmakuScreen from './components/DanmakuScreen';
import MobileClient from './components/MobileClient';

const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Simple Router
  if (route === '#/join') {
    return <MobileClient />;
  }

  // Default to Display Screen
  return <DanmakuScreen />;
};

export default App;
