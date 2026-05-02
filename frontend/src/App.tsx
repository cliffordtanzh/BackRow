import { useState } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';

import { type Lang } from './types/Lang';

import EntryPage from './pages/EntryPage';
import ManagementPage from './pages/ManagementPage';
import AnalysisPage from './pages/AnalysisPage'

import './App.css';


function App() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>(() => 
    localStorage.getItem('lang') as Lang || 'en'
  );
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const stored = localStorage.getItem('Jwt_token') || null;
    return stored !== null;
  })
    
  return (
    <div>
      <Routes>
        <Route path='/' element={
          <ManagementPage
            navigate={navigate}
            lang={lang}
            setLang={setLang}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
          />
        }/>
        <Route path='/entry' element={
          <EntryPage
            navigate={navigate}
            lang={lang}
            setLang={setLang}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
          />
        }/>
        <Route path='/analysis' element={
          <AnalysisPage
            navigate={navigate}
            lang={lang}
            setLang={setLang}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
          />
        }/>
      </Routes>
    </div>
  )
}

export default App;