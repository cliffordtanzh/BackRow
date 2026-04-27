import { useState } from 'react';
import axios from 'axios';

import type { Lang } from '../types/Lang';
import type { Team } from '../types/Team';

import teamHeaders from '../assets/team_inputs.json';

import './ManageInputs.css'


type TeamManageInputsProps = {
  lang: Lang
}


function TeamManageInputs ({ 
  lang
}: TeamManageInputsProps) {

  const[teamState, setTeamState] = useState<Team>({
    teamID: 0,
    teamName: 'SKVB',
  });

  function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault();
    axios.post('http://localhost:8000/teams', teamState)
  }

  return (
    <div className='manage-inputs'>
      <form onSubmit={handleSubmit}>

        {
          teamHeaders.map((header) => (
            <div 
              className='manage-inputs__field'
              key={header['key']}
            >
              <label className='manage-inputs__label'>{header[lang]}</label>
              <input className='field-input'
                onChange={(event) => (
                  setTeamState((prev) => ({...prev, [header['key']]: event.target.value}))
                )}
              />
            </div>
          ))
        }

        <button className='manage-inputs__submit' type='submit'>Submit</button>
      </form>
    </div>
  )
}

export default TeamManageInputs;