import { useState } from 'react';
import axios from 'axios';

import ErrorMessage from '../general/ErrorMessage';
import SuccessMessage from '../general/SuccessMessage';
import FieldInput from '../general/FieldInput';

import useResponse from '../../hooks/useResponse';

import type { Lang } from '../../types/Lang';
import type { TeamCreate } from '../../types/TeamCreate';
import { DEFAULT_RESPONSE } from '../../types/Response';

import headers from '../../assets/headers.json';
import teamHeaders from '../../assets/team_inputs.json';

import './ManageInputs.css';


type TeamManageInputsProps = {
  lang: Lang
  onSuccess: () => void
}

const DEFAULT_TEAM: TeamCreate = {'teamName': ''}


function TeamManageInputs ({ 
  lang,
  onSuccess
}: TeamManageInputsProps) {

  const [error, setError, success, setSuccess] = useResponse();
  const [teamState, setTeamState] = useState<TeamCreate>(DEFAULT_TEAM);

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();
    if(teamState.teamName === DEFAULT_TEAM.teamName) {
      setError((prev) => ({...prev, message: 'Team cannot be empty'}))
      setSuccess(DEFAULT_RESPONSE);
      return;
    }

    axios.post(`${import.meta.env.VITE_API_URL}/team`, teamState)
    .then((resp) => {
      onSuccess();
      setTeamState(DEFAULT_TEAM);
      setError(DEFAULT_RESPONSE);
      setSuccess((prev) => ({...prev, message: resp.data.detail}))
    })
    .catch((resp) => {
      setError((prev) => ({...prev, message: resp.response.data.detail}))
      setSuccess(DEFAULT_RESPONSE)
    })
  }

  return (
    <div className='manage-inputs'>
      <form onSubmit={handleSubmit}>

        <div className='manage-inputs__field'>
          <label className='manage-inputs__label'>{teamHeaders[0][lang]}</label>
          <FieldInput
            setField={(val) => (setTeamState((prev) => ({...prev, teamName: val})))}
          />
        </div>

        <div className='manage-inputs__field'>
          <button className='manage-inputs__submit' type='submit'>
            {headers['manage_submit_button'][lang]}
          </button>
          {error.message && <ErrorMessage response={error}/>}
          {success.message && <SuccessMessage response={success}/>}
        </div>

      </form>
    </div>
  )
}

export default TeamManageInputs;