import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import ReactPlayer from 'react-player'
import axios from 'axios';

import LanguageSelector from '../components/LanguageSelector.tsx';
import ModeSelector from '../components/ModeSelector.tsx';
import TeamSelector from '../components/TeamSelector.tsx';
import FieldInput from '../components/FieldInput.tsx';
import HistoryPanel from '../components/HistoryPanel.tsx';
import TeamStatsInputs from '../components/TeamStatsInputs.tsx'
import NavButton from '../components/NavButton.tsx';

import headers from '../assets/headers.json';

import type { TeamEvent } from '../types/TeamEvent.tsx';
import type { BiLabel } from '../types/BiLabel.ts';
import type { Team } from '../types/Team.ts';
import type { Lang } from '../types/Lang.ts'

import './StatsPage.css';


function StatsPage() {
  const navigate = useNavigate();

  // All states needed
  const[lang, setLang] = useState<Lang>('en');
  const[isPlayerMode, setIsPlayerMode] = useState<boolean>(false);
  const[videoURL, setVideoURL] = useState<string>('');

  const[teams, setTeams] = useState<Team[]>([]);
  const [gameName, setGameName] = useState<string>('Game 1');
  
  const [selectedTeam, setSelectedTeam] = useState<Team>({
    teamID: 0,
    teamName: 'SKVB',
  });

  const [eventID, setEventID] = useState<number>(0);
  const [history, setHistory] = useState<TeamEvent[]>([]);
  const [ownPointTotal, setOwnTotal] = useState<number>(0);
  const [oppPointTotal, setOppTotal] = useState<number>(0);

  const ref = useRef<HTMLDivElement>(null)

  // Fetches
  const fetchTeams = async () => {
    const teams = await axios.get('http://localhost:8000/teams');
    setTeams(teams.data);
  }

  // Hooks
  useEffect(() => {fetchTeams()}, [])

  function undoHistory() {
    setHistory((prev) => {
      if (history.length === 0) {
        return prev;
      }
  
      const undid = history.slice(0, -1);
      const prevEvent = undid[undid.length - 1];

      setOwnTotal(prevEvent?.ownPointTotal ?? 0);
      setOppTotal(prevEvent?.oppPointTotal ?? 0);

      return undid;
    });
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
      selectedTeam,
      gameName,
      pointMethod,
      ownPointTotal: updatedOwn,
      oppPointTotal: updatedOpp,
    }]));

    setEventID((prev) => prev + 1)
  }

  return (
    <div className='app-shell'>
      <div className='app-shell__controls'>
        <div className='app-shell__controls-left'>
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
            isPlayerMode={isPlayerMode}
            setIsPlayerMode={setIsPlayerMode}
          />
          <TeamSelector
            teams={teams}
            selectedTeam={selectedTeam}
            setSelectedTeam={setSelectedTeam}
          />
        </div>

        <div className='app-shell__controls-center'>
          <FieldInput
            setField={setVideoURL}
            placeholder={'YouTube URL'}
          />
        </div>
      </div>

      <div className='app-shell__main'>
        <div className='app-shell__video'>
          <div className='app-shell__video-frame'>
            {videoURL && <ReactPlayer
              src={videoURL}
              controls={true} 
            />}
          </div>
        </div>
        
        <div className='app-shell__center'>
          <div className='app-shell__column-title'>
            {headers['stats_page'][lang]}</div>
          <TeamStatsInputs
            lang={lang}
            eventRecorder={onRecordEvent}
          />
        </div>

        <div className='app-shell__right'>
          <div className='app-shell__right--header'>
            <div className='app-shell__column-title'>
              {headers['history_panel'][lang]}</div>

            <button 
              className='app-shell__right--header button'
              onClick={undoHistory}
            >↶{headers["undo"][lang]}</button>
          </div>

          <HistoryPanel
            lang={lang}
            history={history}
            scrollDown={ref}
          />
        </div>

      </div>
    </div>
  )
}

export default StatsPage;