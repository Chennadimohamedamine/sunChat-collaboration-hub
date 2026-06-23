import { useState, useEffect} from 'react';
import AuthPage from './pages/AuthPage';
import type { AppConfig} from './types/type';
import { useAuth } from './context/AuthContext';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import StatusCallback from './componnent/StatusCallback';
import ChatDashboard from './pages/ChatDashboard';
// import { socketService } from './service/socket.service';


export default function App() {

  const { isAuthenticated } = useAuth();

  const [config, setConfig] = useState<AppConfig>({
    darkMode: false,
    primaryAccent: '#FF6B35'
  });




  useEffect(() => {
    const root = document.documentElement;
    if (config.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [config.darkMode]);



  return (
    <div className={`w-full min-h-screen ${config.darkMode ? 'dark' : ''}`}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/status-callback"
            element={<StatusCallback />}
          />
          <Route
            path="/*"
            element={
              isAuthenticated ? (
                <ChatDashboard
                  config={config}
                  setConfig={setConfig}

                />
                  
              ) : (
                <AuthPage
                  config={config}
                  setConfig={setConfig}
                />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </div >
  );
}

