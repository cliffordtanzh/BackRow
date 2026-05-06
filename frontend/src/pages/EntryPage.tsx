import axios from 'axios';

import { useState, useEffect } from 'react';
import { type NavigateFunction } from 'react-router-dom';

import { useResponse } from '../hooks/useResponse';
import { useHistory } from '../hooks/useHistory.ts';

import HistoryButton from '../components/entry/HistoryButton.tsx';
import HistoryPanel from '../components/general/HistoryPanel.tsx';
import StatsInputs from '../components/entry/StatsInputs.tsx';
import VideoPlayer from '../components/entry/VideoPlayer.tsx';

import LanguageSelector from '../components/general/LanguageSelector.tsx';
import ModeSelector from '../components/general/ModeSelector.tsx';
import ErrorMessage from '../components/general/ErrorMessage.tsx';
import SuccessMessage from '../components/general/SuccessMessage.tsx';
import NavButton from '../components/general/NavButton.tsx';
import GeneralButton from '../components/general/GeneralButton.tsx';

import Event from '../types/EventCreate.ts';
import { type History } from '../types/History.ts';
import { type Response, DEFAULT_RESPONSE } from '../types/Response';
import { type Lang } from '../types/Lang'

import headers from '../assets/headers.json';
import responses from '../assets/responses.json';

import '../App.css'
import './EntryPage.css';
import useVideo from '../hooks/useVideo.ts';


type EntryPageProps = {
  navigate: NavigateFunction,
  lang: Lang,
  setLang: React.Dispatch<React.SetStateAction<Lang>>,
  isLoggedIn: boolean
}


function EntryPage({
  navigate,
  lang,
  setLang,
  isLoggedIn,
}: EntryPageProps) {

  // From App.tsx
  const loggedInResponse: Response = {
    message: `Hello ${localStorage.getItem('playerName')}`,
    fade: false,
  }

  // All states needed
  const [isPlayerMode, setIsPlayerMode] = useState<boolean>(true);
  
  const [videoURL, setVideoURL, gameName, setGameName, fetchError, fetchSuccess] = useVideo(lang);
  const [teamHistory, setTeamEvents] = useHistory('player', videoURL, gameName);
  const [playerHistory, setPlayerEvents] = useHistory('team', videoURL, gameName);

  const [postError, setPostError, postSuccess, setPostSuccess] = useResponse();

  const allErrors: Response[] = [fetchError, postError];
  const allSuccess: Response[] = [fetchSuccess, postSuccess];

  const hasError: boolean = allErrors.some((resp) => (resp && resp.message))
  const hasSuccess: boolean = allSuccess.some((resp) => (resp && resp.message))

  const history: History = isPlayerMode ? playerHistory : teamHistory

  const clearHistory = (
    itemKey: string,
    setter: React.Dispatch<React.SetStateAction<Event[]>>,
  ) => {
    setter([]);
    localStorage.removeItem(itemKey)
  }

  const undoHistory = (
    setter: React.Dispatch<React.SetStateAction<Event[]>>
  ) => {
    setter((prev) => prev.slice(0, -1));
  }

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
            navigate={() => navigate('/analysis')}
            buttonHeader={headers['analysis_button']}
          />
          <ModeSelector
            lang={lang}
            isPlayerMode={isPlayerMode}
            setIsPlayerMode={setIsPlayerMode}
          />
        </div>

        <div className='shell-error'>
          {isLoggedIn && <SuccessMessage response={loggedInResponse}/>}
          {hasSuccess && allSuccess.map((success: Response) => (
            success.message && <SuccessMessage key={success.message} response={success}/>
          ))}
          {hasError && allErrors.map((error: Response) => (
            error.message && <ErrorMessage key={error.message} response={error}/>
          ))}
          {!hasError && !hasSuccess && <GeneralButton
            label='Good Luck'
            onClick={() => (null)}
            />}
        </div>

        <div className='shell-title'>
          {headers['title'][lang]}
        </div>
      </div>


      <div className='entry'>
        <VideoPlayer
          lang={lang}
          videoURL={videoURL}
          gameName={gameName}
          setVideoURL={setVideoURL}
          setGameName={setGameName}
        />

        <div className='entry-center'>
          <div className='entry-header'>
            {headers['entry_button'][lang]}
          </div>
            <StatsInputs
              lang={lang}
              isPlayerMode={isPlayerMode}
              history={isPlayerMode ? playerHistory: teamHistory}
              setEvents={isPlayerMode ? setPlayerEvents : setTeamEvents}
              setPostError={setPostError}
              setPostSuccess={setPostSuccess}
              clearHistory={() => (clearHistory(
                isPlayerMode ? 'player' : 'team',
                isPlayerMode ? setPlayerEvents : setTeamEvents,
              ))}
            />
        </div>
        
        <div className='entry-right'>
          <div className='entry-header'>
            <HistoryButton
              lang={lang}
              onClick={() => undoHistory(
                isPlayerMode ? setPlayerEvents : setTeamEvents,
              )}
              type={'undo'}
            />
            {headers['history_panel'][lang]}
            <HistoryButton
              lang={lang}
              onClick={() => clearHistory(
                isPlayerMode ? 'player' : 'team',
                isPlayerMode ? setPlayerEvents : setTeamEvents,
              )}
              type={'clear'}
            />
          </div>

          <HistoryPanel
            lang={lang}
            events={history.events}
            isPlayerMode={history.isPlayerMode}
            teamName={history.teamName}
            playerName={history.playerName}
          />
        </div>
      </div>

    </div>
  )
}

export default EntryPage;