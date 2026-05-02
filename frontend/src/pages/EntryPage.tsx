import { useState, useEffect } from 'react';
import { type NavigateFunction } from 'react-router-dom';

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
import responses from '../assets/responses.json';

import '../App.css'
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

  const loggedInResponse: Response = {
    message: `Hello ${localStorage.getItem('playerName')}`,
    fade: false,
  }

  useEffect(() => {
    setIsLoggedIn((localStorage.getItem('Jwt_token') || null) !== null);
  }, [])

  // All states needed
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
      setFetchError((prev) => ({...prev, message: responses['url_input_error'][lang]}))
      setFetchSuccess(DEFAULT_RESPONSE)
      return;
    }

    axios.get(`https://www.youtube.com/oembed?url=${videoURL}&format=json`)
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

  }, [videoURL])

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
            value={videoURL}
            placeholder={'YouTube URL'}
          />
          <div className='entry-video__frame'>
            {videoURL && <ReactPlayer
              src={videoURL}
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
              results={isPlayerMode ? playerResultsCreate: teamResultsCreate}
              setHistory={isPlayerMode ? setPlayerHistory : setTeamHistory}
              setPostError={setPostError}
              setPostSuccess={setPostSuccess}
            />
        </div>
        
        <div className='entry-right'>
          <div className='entry-header'>
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