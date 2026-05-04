import axios from 'axios';

import { useState, useEffect } from 'react';
import { type NavigateFunction } from 'react-router-dom';

import { useResults } from '../hooks/useResults';
import { useEntity } from '../hooks/useEntity';
import { useResponse } from '../hooks/useResponse';

import ResultsViewer from '../components/analysis/ResultsViewer';
import StatsOverview from '../components/analysis/StatsOverview';

import LanguageSelector from '../components/general/LanguageSelector';
import Selector from '../components/general/Selector';
import NavButton from '../components/general/NavButton';
import ModeSelector from '../components/general/ModeSelector';
import SuccessMessage from '../components/general/SuccessMessage';
import ErrorMessage from '../components/general/ErrorMessage';
import GeneralButton from '../components/general/GeneralButton';
import HistoryPanel from '../components/general/HistoryPanel';

import { type Lang } from '../types/Lang';
import { type Response } from '../types/Response';
import { type Role, DEFAULT_ROLE } from '../types/Role';

import headers from '../assets/headers.json'

import '../App.css'
import './AnalysisPage.css'


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
    message: isLoggedIn ? `Hello ${localStorage.getItem('playerName')}`: 'Log in to view results',
    fade: false,
  }

  const [isPlayerMode, setIsPlayerMode] = useState<boolean>(true);

  const [
    teams, 
    selectedTeam, 
    setSelectedTeam, 
  ] = useEntity(lang, 'team');
  
  const [
    players, 
    selectedPlayer, 
    setSelectedPlayer, 
  ] = useEntity(lang, 'player');
  
  const [role, setRole] = useState<Role>(DEFAULT_ROLE);
  const [fetchSuccess, setFetchSuccess, fetchError, setFetchError] = useResponse();

  const [ results, history, selectedResult, setSelectedResult ] = useResults(
    lang,
    isPlayerMode,
    selectedPlayer,
    selectedTeam,
    setRole,
    setFetchSuccess,
    setFetchError,
  );

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
          {isLoggedIn ? 
            <SuccessMessage response={loggedInResponse}/> : 
            <ErrorMessage response={loggedInResponse}/>
          }
          <GeneralButton
            label='Good Luck'
            onClick={() => (null)}
            />
        </div>

        <div className='shell-title'>
          {headers['title'][lang]}
        </div>
      </div>

      <div className='analysis'>
        <div className='analysis-panel'>
          <div className='selector-bar'>

            <div>
              {['root', 'manager'].includes(role) && <div>
                <div className='selector-label'>
                  Player Name
                </div>
                <Selector
                  items={players}
                  selected={selectedPlayer}
                  setSelected={setSelectedPlayer}
                  getID={(player) => player.ID}
                  getName={(player) => player.name}
                />
              </div>}
            </div>

            <div>
              {['root'].includes(role) && <div>
                <div className='selector-label'>
                  Team Name
                </div>
                <Selector
                  items={teams}
                  selected={selectedTeam}
                  setSelected={setSelectedTeam}
                  getID={(team) => team.ID}
                  getName={(team) => team.name}
                />
              </div>}
            </div>
          </div>

          <ResultsViewer
            results={results}
            selectedResult={selectedResult}
            setSelectedResult={setSelectedResult}
          />
        </div>

        <div className='analysis-panel'>
          {(history.events.length > 0) && <StatsOverview
            lang={lang}
            history={history}
          />}
        </div>

        {(history.events.length > 0) && <HistoryPanel
          lang={lang}
          history={history}
          isPlayerMode={isPlayerMode}
          analysisMode={true}
        />}

      </div>
    </div>
  )
}

export default AnalysisPage;