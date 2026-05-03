import { useState } from 'react';
import axios from 'axios';

import ErrorMessage from '../general/ErrorMessage';
import SuccessMessage from '../general/SuccessMessage';
import FieldInput from '../general/FieldInput';

import { useResponse } from '../../hooks/useResponse';

import { type TeamCreate, DEFAULT_TEAM_CREATE } from '../../types/TeamCreate';
import { type Lang } from '../../types/Lang';
import { DEFAULT_RESPONSE } from '../../types/Response';

import headers from '../../assets/headers.json';
import teamHeaders from '../../assets/team_inputs.json';
import responses from '../../assets/responses.json';
import './ManageInputs.css';


type TeamEntryProps = {
  lang: Lang,
  onSuccess: () => void
}

function TeamEntry ({ lang, onSuccess }: TeamEntryProps) {

  const [error, setError, success, setSuccess] = useResponse();
  const [teamState, setTeamState] = useState<TeamCreate>(DEFAULT_TEAM_CREATE);

  const handleSubmit = (event: React.SubmitEvent) => {
    event.preventDefault();
    if(teamState.name === DEFAULT_TEAM_CREATE.name) {
      setError((prev) => ({...prev, message: responses['empty_player_number_error'][lang]}))
      setSuccess(DEFAULT_RESPONSE);
      return;
    }

    axios.post(`${import.meta.env.VITE_API_URL}/team`, teamState)
    .then((resp) => {
      onSuccess();
      setTeamState(DEFAULT_TEAM_CREATE);

      setError(DEFAULT_RESPONSE);
      setSuccess((prev) => ({
        ...prev, 
        message: responses[resp.data.detail as keyof typeof responses][lang]
      }))
      
    })
    .catch((resp) => {
      const responseKey: string = resp.response.data.detail.split(': ')[1]
      setError((prev) => ({
        ...prev, 
        message: responses[responseKey as keyof typeof responses][lang]
      }))
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

export default TeamEntry;