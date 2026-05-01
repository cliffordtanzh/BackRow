import axios from 'axios';

import StatsButton from './StatsButton';

import Event, { DEFAULT_EVENT } from '../../types/Event';
import { type Response, DEFAULT_RESPONSE } from '../../types/Response';
import { type BiLabel } from '../../types/BiLabel';
import { type Lang } from '../../types/Lang';
import { type ResultsCreate } from '../../types/ResultsCreate';

import playerStats from '../../assets/player_stats.json'
import teamStats from '../../assets/team_stats.json'
import header from '../../assets/headers.json';
import './StatsInputs.css';


function recordPlayerEvent(
  eventType: BiLabel, 
  results: ResultsCreate, 
  setHistory: React.Dispatch<React.SetStateAction<Event[]>>
) {
  const pointEng = eventType.en
  let pointDelta: number = 0

  if(
    pointEng.includes('Attempt') || 
    pointEng.includes('Received') || 
    pointEng === 'Spike Cover'
  ) {
    pointDelta = 0

  } else if(
    pointEng.includes('Ace') ||
    pointEng.includes('Kill')
  ) {
    pointDelta = 1

  } else {
    pointDelta = -1
  }

  const history = results.history
  const lastEvent = history.length > 0 ? history[history.length - 1] : DEFAULT_EVENT;

  const nextEvent = new Event(
    lastEvent.eventID + 1,
    eventType,
    pointDelta,
  )

  setHistory((prev) => ([...prev, {...nextEvent}]));
};

function recordTeamEvent(
  pointMethod: BiLabel,
  results: ResultsCreate,
  setHistory: React.Dispatch<React.SetStateAction<Event[]>>
) {
  const pointEng = pointMethod.en
  const pointLost = (pointEng.includes('Error') || pointEng.includes('Blocked'));

  const history = results.history
  const lastEvent = history.length > 0 ? history[history.length - 1] : DEFAULT_EVENT;

  const nextEvent = new Event(
    lastEvent.eventID + 1,
    pointMethod,
    pointLost ? -1 : 1,
  );

  setHistory((prev) => ([...prev, nextEvent]));
}

type StatsInputsProps = {
  lang: Lang;
  results: ResultsCreate,
  isPlayerMode: boolean,
  setHistory: React.Dispatch<React.SetStateAction<Event[]>>
  setPostError: React.Dispatch<React.SetStateAction<Response>>
  setPostSuccess: React.Dispatch<React.SetStateAction<Response>>
}

function StatsInputs({
  lang,
  results,
  isPlayerMode,
  setHistory,
  setPostError,
  setPostSuccess,
}: StatsInputsProps) {
  
  const submitEvents = () => {
    const token = localStorage.getItem('Jwt_token') || null
    const teamID = localStorage.getItem('teamID') || null
    if (token === null) {
      setPostError((prev) => ({...prev, message: 'Log in before submitting results'}))
      setPostSuccess(DEFAULT_RESPONSE);
      return;
    }

    if (teamID === null) {
      setPostError((prev) => ({...prev, message: 'A team has not been assigned to you yet'}))
      setPostSuccess(DEFAULT_RESPONSE);
      return;
    }

    if (history.length === 0) {
      setPostError((prev) => ({...prev, message: 'No data to post'}));
      setPostSuccess(DEFAULT_RESPONSE);
      return;
    }

    const payload = {
      ...results,
      history: results.history.map(obj => ({...obj}))
    }

    axios.post(
      `${import.meta.env.VITE_API_URL}/${isPlayerMode ? 'player' : 'team'}_results`,
      payload,
      {headers: {Authorisation: `Bearer ${token}`}}

    ).then((resp) => {
      setPostError(DEFAULT_RESPONSE);
      setPostSuccess((prev) => ({...prev, message: resp.data.detail}));

    }).catch((resp) => {
      setPostError((prev) => ({...prev, message: resp.response.data.detail}))
      setPostSuccess(DEFAULT_RESPONSE)
    })
  }

  const recordEvent = isPlayerMode ? recordPlayerEvent : recordTeamEvent

  return (
    <div className='stats_input'>
      <div className='stats-inputs__keypad'>
        {
          Object.entries(isPlayerMode ? playerStats : teamStats).map(([stat, statHeader]) => (
            <div key={stat} className='stats-inputs__button'>
              {statHeader.map((header: BiLabel) => (
                <StatsButton
                  key={header['en']}
                  onClick={() => recordEvent(header, results, setHistory)}
                  label={header[lang]}
                />
              ))}
            </div>
          ))
        }
      </div>

      <button 
        className='stats-inputs__submit'
        onClick={submitEvents}
      >
        {header['stats_submit_button'][lang]}
      </button>
    </div>
  )
}

export default StatsInputs;