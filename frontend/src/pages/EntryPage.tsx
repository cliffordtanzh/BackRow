import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import ReactPlayer from 'react-player'
import axios from 'axios';

import LanguageSelector from '../components/general/LanguageSelector.tsx';
import ModeSelector from '../components/general/ModeSelector.tsx';
import ErrorMessage from '../components/general/ErrorMessage.tsx';
import SuccessMessage from '../components/general/SuccessMessage.tsx';
import FieldInput from '../components/general/FieldInput.tsx';
import NavButton from '../components/general/NavButton.tsx';
import GeneralButton from '../components/general/GeneralButton.tsx';

import HistoryButton from '../components/entry/HistoryButton.tsx';
import HistoryPanel from '../components/entry/HistoryPanel.tsx';
import StatsInputs from '../components/entry/StatsInputs.tsx';

import useResponse from '../hooks/useResponse';

import Event from '../types/Event';

import { type Response, DEFAULT_RESPONSE } from '../types/Response';
import { type ResultsCreate } from '../types/ResultsCreate';
import { type Lang } from '../types/Lang'

import headers from '../assets/headers.json';
import './EntryPage.css';


function useResultsCreate(itemKey: 'player' | 'team', gameName: string): [
  ResultsCreate,
  React.Dispatch<React.SetStateAction<Event[]>>
] {
  const stored = localStorage.getItem(`${itemKey}History`);
  const arr = stored ? JSON.parse(stored) : [];

  const storedHistory = arr.map((obj: any) => new Event(
    obj.eventID, 
    obj.eventType, 
    obj.pointDelta, 
  ));
  
  const [history, setHistory] = useState<Event[]>([...storedHistory]);

  const results: ResultsCreate = {
    history: history,
    playerName: localStorage.getItem('playerName') || 'Player',
    teamName: localStorage.getItem('teamName') || 'Team',
    gameName: gameName
  }

  return [ results, setHistory ]
}


function EntryPage() {
  const navigate = useNavigate();

  // All states needed
  const [lang, setLang] = useState<Lang>(() => localStorage.getItem('lang') as Lang || 'en');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const stored = localStorage.getItem('Jwt_token') || null;
    return stored !== null;
  })

  const loggedInResponse: Response = {
    message: `Hello ${localStorage.getItem('playerName')}`,
    fade: false,
  }

  const [gameName, setGameName] = useState<string>('');
  const [teamResultsCreate, setTeamHistory] = useResultsCreate('team', gameName);
  const [playerResultsCreate, setPlayerHistory] = useResultsCreate('player', gameName);

  const [isPlayerMode, setIsPlayerMode] = useState<boolean>(true);
  const [videoURL, setVideoURL] = useState<string>(
    'https://www.youtube.com/watch?v=hgPI9NJdPFc&list=RDhgPI9NJdPFc&start_radio=1'
  );

  const [fetchError, setFetchError, fetchSuccess, setFetchSuccess] = useResponse();
  const [postError, setPostError, postSuccess, setPostSuccess] = useResponse();

  const allErrors = [fetchError, postError];
  const allSuccess = [fetchSuccess, postSuccess];

  const hasError = allErrors.some((resp) => (resp && resp.message))
  const hasSuccess = allSuccess.some((resp) => (resp && resp.message))

  console.log(teamResultsCreate)

  const clearHistory = (
    itemKey: string,
    setter: React.Dispatch<React.SetStateAction<Event[]>>,
  ) => {
    setter([]);
    localStorage.removeItem(itemKey)
  }

  const undoHistory = (
    itemKey: string,
    setter: React.Dispatch<React.SetStateAction<Event[]>>
  ) => {
    setter((prev) => prev.slice(0, -1));
    localStorage.removeItem(itemKey)
  }

  useEffect(() => { 
    if (!videoURL) {
      return;
    }

    if (!videoURL.includes('youtube.com/watch?v=')) {
      setFetchError((prev) => ({...prev, message: 'Not a YouTube URL'}))
      setFetchSuccess(DEFAULT_RESPONSE)
      return;
    }

    axios.get(`https://www.youtube.com/oembed?url=${videoURL}&format=json`)
    .then((resp) => {
      setGameName(resp.data.title)
      setFetchError(DEFAULT_RESPONSE)
      setFetchSuccess((prev) => ({...prev, message: 'Title fetched'}))
      
    })
    .catch(() => {
      setGameName('');
      setFetchError((prev) => ({...prev, message: 'Game name could not be fetched'}))
      setFetchSuccess(DEFAULT_RESPONSE)
    })

  }, [videoURL])

  useEffect(() => {
    setIsLoggedIn((localStorage.getItem('Jwt_token') || null) !== null);
  }, [])

  return (
    <div className='stats-shell'>
      <div className='stats-shell__main'>
        <div className='stats-shell__controls'>
          <LanguageSelector lang={lang} setLang={setLang}/>
          <NavButton
            lang={lang}
            navigate={() => navigate('/manage')}
            buttonHeader={headers['manage_button']}
          />
          <ModeSelector
            lang={lang}
            isPlayerMode={isPlayerMode}
            setIsPlayerMode={setIsPlayerMode}
          />
        </div>

        <div className='stats-shell__error'>
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

        <div className='stats-shell__title'>
          {headers['title'][lang]}
        </div>
      </div>

      <div className='stats-shell__main'>
        <div className='stats-shell__video'>
          <div className='stats-shell__header'>
            {headers['video'][lang]}
          </div>
          <FieldInput
            setField={setVideoURL}
            value={videoURL}
            placeholder={'YouTube URL'}
          />
          <div className='stats-shell__video-frame'>
            {videoURL && <ReactPlayer
              src={videoURL}
              controls={true} 
              />}
          </div>
        </div>

        <div className='stats-shell__center'>
          <div className='stats-shell__header'>
            {headers['statistics_button'][lang]}
          </div>
            <StatsInputs
              lang={lang}
              isPlayerMode={isPlayerMode}
              results={isPlayerMode ? playerResultsCreate: teamResultsCreate}
              setHistory={isPlayerMode ? setPlayerHistory : setTeamHistory}
              setPostError={setPostError}
              setPostSuccess={setPostSuccess}
            />
        </div>
        
        <div className='stats-shell__right'>
          <div className='stats-shell__header'>
            <HistoryButton
              lang={lang}
              onClick={() => undoHistory(
                isPlayerMode ? 'player' : 'team',
                isPlayerMode ? setPlayerHistory : setTeamHistory,
              )}
              type={'undo'}
            />
            {headers['history_panel'][lang]}
            <HistoryButton
              lang={lang}
              onClick={() => clearHistory(
                isPlayerMode ? 'player' : 'team',
                isPlayerMode ? setPlayerHistory : setTeamHistory,
              )}
              type={'clear'}
            />
          </div>

          <HistoryPanel
            lang={lang}
            results={isPlayerMode ? playerResultsCreate : teamResultsCreate}
            isPlayerMode={isPlayerMode}
          />
        </div>
      </div>

    </div>
  )
}

export default EntryPage;