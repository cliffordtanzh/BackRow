import axios from 'axios';

import { useState, useEffect } from 'react';
import { type NavigateFunction } from 'react-router-dom';

import { useResults } from '../hooks/useResults';
import { useEntity } from '../hooks/useEntity';
import { useResponse } from '../hooks/useResponse';

import ResultsViewer from '../components/analysis/ResultsViewer';
import MatchOverview from '../components/analysis/MatchOverview';

import LanguageSelector from '../components/general/LanguageSelector';
import Selector from '../components/general/Selector';
import NavButton from '../components/general/NavButton';
import ModeSelector from '../components/general/ModeSelector';
import SuccessMessage from '../components/general/SuccessMessage';
import HistoryPanel from '../components/general/HistoryPanel';

import { type Lang } from '../types/Lang';
import { type EventQuery } from '../types/EventQuery';
import { type Response, DEFAULT_RESPONSE } from '../types/Response';
import { type Role, DEFAULT_ROLE } from '../types/Role';
import { type History, DEFAULT_HISTORY } from '../types/History';

import headers from '../assets/headers.json'
import responses from '../assets/responses.json'

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
    message: `Hello ${localStorage.getItem('playerName')}`,
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

  const [ results, selectedResult, setSelectedResult ] = useResults(
    lang,
    isPlayerMode,
    selectedPlayer,
    selectedTeam,
    setRole,
    setFetchSuccess,
    setFetchError,
  );

  const [ history, setHistory ] = useState<History>(DEFAULT_HISTORY);

  const fetchHistory = () => {
    const payload: EventQuery = {
      ID: selectedResult.resultID,
      isPlayerMode: isPlayerMode
    }

    axios.post(`${import.meta.env.VITE_API_URL}/fetch_events`, payload)
    .then((resp) => {
      setFetchError(DEFAULT_RESPONSE);
      setFetchSuccess((prev) => ({
        ...prev, 
        message: responses[resp.data.detail as keyof typeof responses][lang]
      }));

      setHistory((prev) => ({
        ...prev, 
        events: resp.data.data,
        isPlayerMode: isPlayerMode,
        playerID: selectedPlayer.ID,
        playerName: selectedPlayer.name,
        teamID: selectedTeam.ID,
        teamName: selectedTeam.name,
        youtubeURL: selectedResult.youtubeURL,
        gameName: selectedResult.gameName
      }));
    })
    .catch((resp) => {
      const responseKey: string = resp.response.data.detail.split(': ')[1]
      setFetchError((prev) => ({
        ...prev,
        message: responses[responseKey as keyof typeof responses][lang]
      }));
      setFetchSuccess(DEFAULT_RESPONSE);
    })
  }

  useEffect(() => {
    setIsLoggedIn((localStorage.getItem('Jwt_token') || null) !== null);
  }, [])

  useEffect(() => {
    if (selectedResult == null) {
      return
    }

    fetchHistory()
  }, [selectedResult, isPlayerMode])
  
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
          {(history.events.length > 0) && <MatchOverview
            lang={lang}
            history={history}
          />}
        </div>

        <HistoryPanel
          lang={lang}
          history={history}
          isPlayerMode={isPlayerMode}
          analysisMode={true}
        />

      </div>
    </div>
  )
}

export default AnalysisPage;