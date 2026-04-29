import { useState } from 'react';
import axios from 'axios';

import ErrorMessage from './ErrorMessage';

import type { Lang } from '../types/Lang';
import type { Player } from '../types/Player';
import type { TeamCreate } from '../types/TeamCreate';

import headers from '../assets/headers.json';
import teamHeaders from '../assets/team_inputs.json';

import './ManageInputs.css';
import './ErrorMessage.css';


type TeamManageInputsProps = {
  lang: Lang
  onSuccess: () => void
}

const DEFAULT_TEAM: TeamCreate = {'teamName': ''}


function TeamManageInputs ({ 
  lang,
  onSuccess
}: TeamManageInputsProps) {

  const[error, setError] = useState<string | null>(null);
  const[teamState, setTeamState] = useState<TeamCreate>(DEFAULT_TEAM);

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();
    if(teamState.teamName === DEFAULT_TEAM.teamName) {
      setError('Team must not be empty')
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/teams`, teamState)
      onSuccess();
      setTeamState(DEFAULT_TEAM);
      setError(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.detail ?? 'Something went wrong')
      }
    }
  }

  return (
    <div className='team_manage-inputs'>
      <form onSubmit={handleSubmit}>

        {
          teamHeaders.map((header) => (
            <div 
              className='manage-inputs__field'
              key={header['key']}
            >
              <label className='manage-inputs__label'>{header[lang]}</label>
              <input 
                className='field-input'
                type={header['key'] === 'password' ? 'password' : 'text'}
                value={String(teamState[header['key'] as keyof TeamCreate])}
                onChange={(event) => (
                  setTeamState((prev) => (
                    {...prev, [header['key']]: 
                      header['key'] === 'playerNumber' ? 
                      Number(event.target.value) : 
                      event.target.value
                    }
                  ))
                )}
              />
            </div>
          ))
        }

        <div className='manage-inputs__field'>
          <button className='manage-inputs__submit' type='submit'>
            {headers['manage_submit_button'][lang]}
          </button>
          {error && <ErrorMessage error={error}/>}
        </div>

      </form>
    </div>
  )
}

export default TeamManageInputs;