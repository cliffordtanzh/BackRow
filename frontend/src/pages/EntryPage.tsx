import ReactPlayer from 'react-player'
import axios from 'axios';

import { useState, useEffect } from 'react';
import { type NavigateFunction } from 'react-router-dom';

import { useResponse } from '../hooks/useResponse';

import LanguageSelector from '../components/general/LanguageSelector.tsx';
import ModeSelector from '../components/general/ModeSelector.tsx';
import ErrorMessage from '../components/general/ErrorMessage.tsx';
import SuccessMessage from '../components/general/SuccessMessage.tsx';
import FieldInput from '../components/general/FieldInput.tsx';
import NavButton from '../components/general/NavButton.tsx';
import GeneralButton from '../components/general/GeneralButton.tsx';

import HistoryButton from '../components/entry/HistoryButton.tsx';
import HistoryPanel from '../components/general/HistoryPanel.tsx';
import StatsInputs from '../components/entry/StatsInputs.tsx';

import Event from '../types/Event';
import { type Response, DEFAULT_RESPONSE } from '../types/Response';
import { type Lang } from '../types/Lang'
import { type History } from '../types/History'

import headers from '../assets/headers.json';
import responses from '../assets/responses.json';

import '../App.css'
import './EntryPage.css';


function useHistory(itemKey: string, youtubeURL: string, gameName: string): [
  History,
  React.Dispatch<React.SetStateAction<Event[]>>
] {
  const stored = localStorage.getItem(`${itemKey}Events`);
  const arr = stored ? JSON.parse(stored) : [];

  const storedEvents = arr.map((obj: any) => new Event(
    obj.eventID, 
    obj.eventType, 
    obj.pointDelta, 
  ));
  
  const [events, setEvents] = useState<Event[]>([...storedEvents]);

  const results: History = {
    events: events,
    isPlayerMode: itemKey === 'player',
    playerID: Number(localStorage.getItem('playerID')) || 0,
    playerName: localStorage.getItem('playerName') || 'Player',
    teamID: Number(localStorage.getItem('teamID')) || 0,
    teamName: localStorage.getItem('teamName') || 'Team',
    youtubeURL: youtubeURL,
    gameName: gameName,
  }

  useEffect(() => {localStorage.setItem(
    `${itemKey}Events`, 
    JSON.stringify(events)
  )}, [events])

  return [ results, setEvents ]
}


type EntryPageProps = {
  navigate: NavigateFunction,
  lang: Lang,
  setLang: React.Dispatch<React.SetStateAction<Lang>>,
  isLoggedIn: boolean
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>,
}


function EntryPage({
  navigate,
  lang,
  setLang,
  isLoggedIn,
  setIsLoggedIn,
}: EntryPageProps) {

  // From App.tsx
  const loggedInResponse: Response = {
    message: `Hello ${localStorage.getItem('playerName')}`,
    fade: false,
  }

  useEffect(() => {
    setIsLoggedIn((localStorage.getItem('Jwt_token') || null) !== null);
  }, [])

  // All states needed
  const [isPlayerMode, setIsPlayerMode] = useState<boolean>(true);
  const [youtubeURL, setVideoURL] = useState<string>(() => (
    localStorage.getItem('youtubeURL') ||
    'https://www.youtube.com/watch?v=qS0L_gR0u0Q'

  ));

  const [gameName, setGameName] = useState<string>('');
  const [teamHistory, setTeamEvents] = useHistory('player', youtubeURL, gameName);
  const [playerHistory, setPlayerEvents] = useHistory('team', youtubeURL, gameName);

  const [fetchError, setFetchError, fetchSuccess, setFetchSuccess] = useResponse();
  const [postError, setPostError, postSuccess, setPostSuccess] = useResponse();

  const allErrors = [fetchError, postError];
  const allSuccess = [fetchSuccess, postSuccess];

  const hasError = allErrors.some((resp) => (resp && resp.message))
  const hasSuccess = allSuccess.some((resp) => (resp && resp.message))

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

  useEffect(() => { 
    if (!youtubeURL) {
      return;
    }

    if (!youtubeURL.includes('youtube.com/watch?v=')) {
      setFetchError((prev) => ({...prev, message: responses['url_input_error'][lang]}))
      setFetchSuccess(DEFAULT_RESPONSE)
      return;
    }

    localStorage.setItem('youtubeURL', youtubeURL)

    axios.get(`https://www.youtube.com/oembed?url=${youtubeURL}&format=json`)
    .then((resp) => {
      setGameName(resp.data.title)
      setFetchError(DEFAULT_RESPONSE)
      setFetchSuccess((prev) => ({...prev, message: responses['title_fetch_success'][lang]}))
      
    })
    .catch(() => {
      setGameName('');
      setFetchError((prev) => ({...prev, message: responses['title_fetch_error'][lang]}))
      setFetchSuccess(DEFAULT_RESPONSE)
    })

  }, [youtubeURL])

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
        <div className='entry-video'>
          <div className='entry-header'>
            {headers['video'][lang]}
          </div>
          <FieldInput
            setField={setVideoURL}
            value={youtubeURL}
            placeholder={'YouTube URL'}
          />
          <div className='entry-video__frame'>
            {youtubeURL && <ReactPlayer
              src={youtubeURL}
              controls={true} 
              />}
          </div>
        </div>

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
            history={isPlayerMode ? playerHistory : teamHistory}
            isPlayerMode={isPlayerMode}
          />
        </div>
      </div>

    </div>
  )
}

export default EntryPage;