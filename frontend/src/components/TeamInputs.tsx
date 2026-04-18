import TeamButton from './TeamButton'
import teamStats from "../assets/team_stats.json";

import type { BiLabel } from '../types/BiLabel';
import type { Lang } from '../types/Lang'

import './TeamInputs.css'



type TeamInputsProps = {
  lang: Lang,
  eventRecorder: (pointMethod: BiLabel) => void,
}


function TeamInputs({
  lang,
  eventRecorder,
}: TeamInputsProps) {

  const setScored = ((pointMethod: BiLabel) => {
    eventRecorder(pointMethod);
  });
  const setLost = ((pointMethod: BiLabel) => {
    eventRecorder(pointMethod);
  });

  
  return (
    <div className='team-inputs'>
      <div className='team-inputs__button'>
        {teamStats['scored'].map((header) => (
          <TeamButton
            label={header[lang]}
            onClick={() => setScored(header)}
            key={header[lang]}
          />
        ))}
      </div>

      <div className='team-inputs__button team-inputs__button--right'>
        {teamStats['lost'].map((header) => (
          <TeamButton
            label={header[lang]}
            onClick={() => setLost(header)}
            key={header[lang]}
          />
        ))}
      </div>
    </div>
  )
}

export default TeamInputs;