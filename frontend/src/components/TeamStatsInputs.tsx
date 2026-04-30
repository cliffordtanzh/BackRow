import axios from 'axios';

import TeamButton from './TeamButton';
import teamStats from '../assets/team_stats.json';
import header from '../assets/headers.json';

import type { BiLabel } from '../types/BiLabel';
import type { Lang } from '../types/Lang';
import type { TeamEvent } from '../types/TeamEvent';
import type { TeamResults } from '../types/TeamResults';

import './TeamStatsInputs.css';


type TeamStatsInputsProps = {
  lang: Lang,
  gameName: string,
  teamName: string,
  eventRecorder: (pointMethod: BiLabel) => void,
  history: TeamEvent[],
  setPostError: React.Dispatch<React.SetStateAction<string | null>>
}


function TeamStatsInputs({
  lang,
  gameName,
  teamName,
  eventRecorder,
  history,
  setPostError
}: TeamStatsInputsProps) {

  const setScored = ((pointMethod: BiLabel) => {
    eventRecorder(pointMethod);
  });
  const setLost = ((pointMethod: BiLabel) => {
    eventRecorder(pointMethod);
  });

  const submitEvents = async () => {
    try {
      const payload: TeamResults = {
        history: history,
        gameName: gameName,
        teamName: teamName,
      }
      
      if (history.length === 0) {
        setPostError('No data to post');
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/team_results`, 
        payload
      )
      setPostError(null)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setPostError(error.response?.data?.detail ?? 'Something went wrong')
      }
    }
  }

  return (
    <div className='team_input'>
      <div className='team-inputs__keypad'>
        <div className='team-inputs__button'>
          {teamStats['scored'].map((header) => (
            <TeamButton
              label={header[lang]}
              onClick={() => setScored(header)}
              key={header[lang]}
            />
          ))}
        </div>

        <div className='team-inputs__button'>
          {teamStats['lost'].map((header) => (
            <TeamButton
              label={header[lang]}
              onClick={() => setLost(header)}
              key={header[lang]}
            />
          ))}
        </div>
      </div>

      <button 
        className='team-inputs__submit'
        onClick={submitEvents}
      >
        {header['stats_submit_button'][lang]}
      </button>
    </div>
  )
}

export default TeamStatsInputs;