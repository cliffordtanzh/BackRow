import { useState, useEffect } from 'react';
import { type NavigateFunction } from 'react-router-dom';

import LanguageSelector from '../components/general/LanguageSelector';
import NavButton from '../components/general/NavButton';
import ModeSelector from '../components/general/ModeSelector';
import SuccessMessage from '../components/general/SuccessMessage';

import { type Lang } from '../types/Lang';
import { type Response } from '../types/Response';

import headers from '../assets/headers.json'

import '../App.css'
import './AnalysisPage.css'
import ResultsViewer from '../components/analysis/ResultsViewer';


type AnalysisPageProps = {
  navigate: NavigateFunction,
  lang: Lang,
  setLang: React.Dispatch<React.SetStateAction<Lang>>,
  isLoggedIn: boolean
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>,
}


function AnalysisPage({
  navigate,
  lang,
  setLang,
  isLoggedIn,
  setIsLoggedIn,
}: AnalysisPageProps) {

  const loggedInResponse: Response = {
    message: `Hello ${localStorage.getItem('playerName')}`,
    fade: false,
  }

  const [isPlayerMode, setIsPlayerMode] = useState<boolean>(true);

  useEffect(() => {
    setIsLoggedIn((localStorage.getItem('Jwt_token') || null) !== null);
  }, [])
  
  return (
    <div className='shell'>
      <div className='control-panel'>
        <div className='control-panel__controls'>
          <LanguageSelector lang={lang} setLang={setLang}/>
          <NavButton
            lang={lang}
            navigate={() => navigate('/')}
            buttonHeader={headers['manage_button']}
            />
          <NavButton
            lang={lang}
            navigate={() => navigate('/entry')}
            buttonHeader={headers['entry_button']}
            />
          <ModeSelector
            lang={lang}
            isPlayerMode={isPlayerMode}
            setIsPlayerMode={setIsPlayerMode}
          />
        </div>

        <div className='shell-error'>
          {isLoggedIn && <SuccessMessage response={loggedInResponse}/>}
        </div>

        <div className='shell-title'>
          {headers['title'][lang]}
        </div>
      </div>

      <div className='analysis'>

        <div className='analysis-panel'>
          <ResultsViewer
            lang={lang}
            isPlayerMode={isPlayerMode}
          />
        </div>

        <div className='analysis-panel'>
        </div>

        <div className='analysis-panel'>
        </div>

      </div>
    </div>
  )
}

export default AnalysisPage;