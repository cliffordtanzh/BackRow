import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import ReactPlayer from 'react-player'
import axios from 'axios';

import LanguageSelector from '../components/LanguageSelector.tsx';
import ModeSelector from '../components/ModeSelector.tsx';
import TeamSelector from '../components/TeamSelector.tsx';
import ErrorMessage from '../components/ErrorMessage.tsx';
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
import GeneralButton from '../components/GeneralButton.tsx';


const DEFAULT_TEAM_EVENT: TeamEvent = {
  eventID: 0,
  pointMethod: {"en": '', "cn": ''},
  ownTotal: 0,
  oppTotal: 0
}


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

  const [history, setHistory] = useState<TeamEvent[]>([]);
  const [teamEventState, setTeamEventState] = useState<TeamEvent>(DEFAULT_TEAM_EVENT)

  const [postError, setPostError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const {teams, teamError, fetchTeams} = useTeams();

  const allErrors = [teamError, postError, fetchError];
  const hasError = allErrors.reduce((a, b) => {
    if ((a === null) && (b === null)) {
      return null;
    } 
    else {
      return 'true';
    }
  }) === 'true'

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

    try {
      fetchTitle();
    } catch (error) {
      setGameName('');
      setFetchError('Game name could not be fetched')
    }
  }, [videoURL])

  useEffect(() => {
    if (teams.length > 0) {
      setSelectedTeam(teams[0])
    }
  }, [teams])
  

  function clearHistory() {
    setHistory([]);
    setTeamEventState(DEFAULT_TEAM_EVENT);
  }

  function undoHistory() {
    if (history.length > 0) {
      const undid = history.slice(0, -1);
      const prevEvent = undid.length > 0 ? undid[undid.length - 1] : DEFAULT_TEAM_EVENT;
      
      setHistory([...undid]);
      setTeamEventState({...prevEvent});
    }
  }
  
  function onRecordEvent(pointMethod: BiLabel) {
    const pointEng = pointMethod.en
    const pointLost = (pointEng.includes("Error") || pointEng.includes("Blocked"));

    const nextEvent: TeamEvent = {
      eventID: teamEventState.eventID + 1,
      pointMethod: pointMethod,
      ownTotal: teamEventState.ownTotal + Number(!pointLost),
      oppTotal: teamEventState.oppTotal + Number(pointLost),
    };

    setTeamEventState(nextEvent)
    setHistory((prev) => ([...prev, {...nextEvent}]));
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
            error && <ErrorMessage key={error} error={error} fade={true}/>
          )) : <GeneralButton
            label="Good Luck"
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