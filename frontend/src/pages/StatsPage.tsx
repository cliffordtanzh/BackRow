import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import ReactPlayer from 'react-player'
import axios from 'axios';

import LanguageSelector from '../components/LanguageSelector.tsx';
import ModeSelector from '../components/ModeSelector.tsx';
import TeamSelector from '../components/TeamSelector.tsx';
import ErrorMessage from '../components/ErrorMessage.tsx';
import GoodLuckButton from '../components/GoodLuckButton.tsx';
import FieldInput from '../components/FieldInput.tsx';
import HistoryButton from '../components/HistoryButton.tsx';
import HistoryPanel from '../components/HistoryPanel.tsx';
import TeamStatsInputs from '../components/TeamStatsInputs.tsx'
import NavButton from '../components/NavButton.tsx';

import headers from '../assets/headers.json';

import type { TeamEvent } from '../types/TeamEvent.tsx';
import type { BiLabel } from '../types/BiLabel.ts';
import type { Team } from '../types/Team.ts';
import type { Lang } from '../types/Lang.ts'

import { useTeams } from '../hooks/useTeams';

import './StatsPage.css';
import { toBoolean } from 'validator';


function StatsPage() {
  const navigate = useNavigate();

  // All states needed
  const[lang, setLang] = useState<Lang>('en');
  const[isPlayerMode, setIsPlayerMode] = useState<boolean>(false);
  const[videoURL, setVideoURL] = useState<string>(
    'https://www.youtube.com/watch?v=hgPI9NJdPFc&list=RDhgPI9NJdPFc&start_radio=1'
  );

  const [gameName, setGameName] = useState<string>('');
  
  const [selectedTeam, setSelectedTeam] = useState<Team>({
    teamID: 0,
    teamName: '',
  });

  const [eventID, setEventID] = useState<number>(0);
  const [history, setHistory] = useState<TeamEvent[]>([]);
  const [ownPointTotal, setOwnTotal] = useState<number>(0);
  const [oppPointTotal, setOppTotal] = useState<number>(0);
  const [postError, setPostError] = useState<string | null>(null);

  const {teams, teamError, fetchTeams} = useTeams();

  const allErrors = [teamError, postError];
  const hasError = allErrors.reduce((a, b) => {
    if ((a === null) || (b === null)) {
      return null;
    }
    return (a || b);
  })

  // Hooks
  useEffect(() => { fetchTeams() }, []);
  useEffect(() => { 
    if (!videoURL) {
      return;
    }

    if (!videoURL.includes('youtube.com/watch?v=')) {
      return;
    }

    const fetchTitle = async () => {
      const query = await axios.get(
        `https://www.youtube.com/oembed?url=${videoURL}&format=json`
      )
      setGameName(query.data.title)
    }

    fetchTitle();
  }, [videoURL])

  useEffect(() => {
    if (teams.length > 0) {
      setSelectedTeam(teams[0])
    }
  }, [teams])

  function undoHistory() {
    setHistory((prev) => {
        if (prev.length === 0) {
        return prev;
        }
    
        const undid = prev.slice(0, -1);
        const prevEvent = undid[undid.length - 1];

        setOwnTotal(prevEvent?.ownTotal ?? 0);
        setOppTotal(prevEvent?.oppTotal ?? 0);

        return undid;
    });
  }

  function clearHistory() {
    setHistory([]);
    setEventID(0);
    setOwnTotal(0);
    setOppTotal(0);
  }

  function onRecordEvent(pointMethod: BiLabel) {
    let updatedOwn;
    let updatedOpp;
    const pointEng = pointMethod.en

    if (pointEng.includes("Error") || pointEng.includes("Blocked")) {
      updatedOwn = ownPointTotal
      updatedOpp = oppPointTotal + 1
      setOppTotal((prev) => prev + 1);
    } 
    
    else {
      updatedOwn = ownPointTotal + 1
      updatedOpp = oppPointTotal
      setOwnTotal((prev) => prev + 1);
    }

    setHistory((prev) => ([...prev, {
      eventID,
      pointMethod,
      ownTotal: updatedOwn,
      oppTotal: updatedOpp,
    }]));

    setEventID((prev) => prev + 1)
  }

  return (
    <div className='stats-shell'>
      <div className='stats-shell__main'>
        <div className='stats-shell__controls'>
          <LanguageSelector 
            lang={lang}
            setLang={setLang}
          />
          <NavButton
            lang={lang}
            navigate={() => navigate("/manage")}
            buttonHeader={headers['manage_button']}
          />
          <ModeSelector
            lang={lang}
            isPlayerMode={isPlayerMode}
            setIsPlayerMode={setIsPlayerMode}
          />
          <TeamSelector
            teams={teams}
            selectedTeam={selectedTeam}
            setSelectedTeam={setSelectedTeam}
          />
        </div>

        <div className='stats-shell__error'>
          {hasError ? allErrors.map((error: string | null) => (
            error && <ErrorMessage key={error} error={error}/>
          )) : <GoodLuckButton/>}
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
          <TeamStatsInputs
            lang={lang}
            gameName={gameName}
            eventRecorder={onRecordEvent}
            teamName={selectedTeam.teamName}
            history={history}
            setPostError={setPostError}
          />
        </div>
        
        <div className='stats-shell__right'>
          <div className='stats-shell__header'>
            <HistoryButton
              lang={lang}
              onClick={undoHistory}
              type={'undo'}
            />
            {headers['history_panel'][lang]}
            <HistoryButton
              lang={lang}
              onClick={clearHistory}
              type={'clear'}
            />
          </div>

          <HistoryPanel
            lang={lang}
            history={history}
            teamName={selectedTeam.teamName}
          />
        </div>
      </div>

    </div>
  )
}

export default StatsPage;