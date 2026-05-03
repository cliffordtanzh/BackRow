import axios from 'axios';

import StatsButton from './StatsButton';

import Event, { DEFAULT_EVENT } from '../../types/Event';
import { type Response, DEFAULT_RESPONSE } from '../../types/Response';
import { type BiLabel } from '../../types/BiLabel';
import { type Lang } from '../../types/Lang';
import { type History } from '../../types/History';
import { type ResultsCreate } from '../../types/ResultsCreate';

import playerStats from '../../assets/player_stats.json'
import teamStats from '../../assets/team_stats.json'
import header from '../../assets/headers.json';
import responses from '../../assets/responses.json'
import './StatsInputs.css';


function recordPlayerEvent(
  eventType: BiLabel, 
  history: History, 
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>
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

  const events = history.events
  const lastEvent = events.length > 0 ? events[events.length - 1] : DEFAULT_EVENT;

  const nextEvent = new Event(
    lastEvent.eventID + 1,
    eventType,
    pointDelta,
  )

  setEvents((prev) => ([...prev, {...nextEvent}]));
};

function recordTeamEvent(
  pointMethod: BiLabel,
  history: History,
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>
) {
  const pointEng = pointMethod.en
  const pointLost = (pointEng.includes('Error') || pointEng.includes('Blocked'));

  const events = history.events
  const lastEvent = events.length > 0 ? events[events.length - 1] : DEFAULT_EVENT;

  const nextEvent = new Event(
    lastEvent.eventID + 1,
    pointMethod,
    pointLost ? -1 : 1,
  );

  setEvents((prev) => ([...prev, nextEvent]));
}

type StatsInputsProps = {
  lang: Lang;
  isPlayerMode: boolean,
  history: History,
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>
  setPostError: React.Dispatch<React.SetStateAction<Response>>
  setPostSuccess: React.Dispatch<React.SetStateAction<Response>>
}

function StatsInputs({
  lang,
  isPlayerMode,
  history,
  setEvents,
  setPostError,
  setPostSuccess,
}: StatsInputsProps) {
  
  const submitEvents = () => {
    const token = localStorage.getItem('Jwt_token') || null
    const teamID = localStorage.getItem('teamID') || null

    const payload: ResultsCreate = {
      events: history.events.map(obj => ({...obj})),
      isPlayerMode: isPlayerMode,
      playerID: history.playerID,
      teamID: history.teamID,
      youtubeURL: history.youtubeURL,
      gameName: history.gameName,
    }

    if (token === null) {
      setPostError((prev) => ({...prev, message: responses['prelogin_post_error'][lang]}))
      setPostSuccess(DEFAULT_RESPONSE);
      return;
    }

    if ((!isPlayerMode) && (teamID === null)) {
      setPostError((prev) => ({...prev, message: responses['unassigned_team_error'][lang]}))
      setPostSuccess(DEFAULT_RESPONSE);
      return;
    }

    if (payload.events.length === 0) {
      setPostError((prev) => ({...prev, message: responses['no_results_error'][lang]}));
      setPostSuccess(DEFAULT_RESPONSE);
      return;
    }

    axios.post(
      `${import.meta.env.VITE_API_URL}/post_results`,
      payload,
      {headers: {Authorisation: `Bearer ${token}`}}

    ).then((resp) => {
      setPostError(DEFAULT_RESPONSE);
      setPostSuccess((prev) => ({
        ...prev, 
        message: responses[resp.data.detail as keyof typeof responses][lang]
      }));

    }).catch((resp) => {
      const responseKey: string = resp.response.data.detail.split(': ')[1]
      setPostError((prev) => ({
        ...prev, 
        message: responses[responseKey as keyof typeof responses][lang]
      }))
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
                  onClick={() => recordEvent(header, history, setEvents)}
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