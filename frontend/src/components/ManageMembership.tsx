import axios from 'axios';
import { useState } from 'react';

import SuccessMessage from './SuccessMessage';
import ErrorMessage from './ErrorMessage';
import Selector from './Selector';

import type { Lang } from '../types/Lang';
import type { Membership } from '../types/Membership';

import headers from '../assets/headers.json';
import membershipHeaders from '../assets/membership_inputs.json';

import './ManageInputs.css'


type manageRoleProps = {
  lang: Lang
  chooseProps: (header: string) => any
}


function ManageRole({ 
  lang,
  chooseProps,
}: manageRoleProps) {

  const[error, setError] = useState<string | null>(null);
  const[success, setSuccess] = useState<string | null>(null);

  const playerProps = chooseProps('player')
  const teamProps = chooseProps('team')
  const roleProps = chooseProps('role')

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();

    const payload: Membership = {
      playerID: playerProps.selected.playerID,
      teamID: teamProps.selected.teamID,
      role: roleProps.selected.role
    }

    try {
      const token = localStorage.getItem('JWT_token')
      axios.post(
        `${import.meta.env.VITE_API_URL}/update_membership`, 
        payload,
        {headers: {Authorisation: `Bearer ${token}`}}
      )

      setSuccess('Membership Updated')
      setError(null)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.detail ?? 'Something went wrong')
        setSuccess(null)
      }
    }
  }

  return (
    <div className='manage-inputs'>
      <form onSubmit={handleSubmit}>
        <div className='role_manage-inputs'>
          <div className='manage-inputs__field'>
            <label className='manage-inputs__label'>
              {membershipHeaders[0][lang]}
            </label>
            <Selector {...playerProps}/>
          </div>

          <div>
            <div className='manage-inputs__field'>
              <label className='manage-inputs__label'>
                {membershipHeaders[1][lang]}
              </label>
              <Selector {...teamProps}/>
            </div>

            <div className='manage-inputs__field'>
              <label className='manage-inputs__label'>
                {membershipHeaders[2][lang]}
              </label>
              <Selector {...roleProps}/>
            </div>
          </div>
        </div>

        <div className='manage-inputs__field'>
          <button className='manage-inputs__submit' type='submit'>
            {headers['manage_submit_button'][lang]}
          </button>
          {error && <ErrorMessage error={error} fade={true}/>}
          {success && <SuccessMessage success={success} fade={true}/>}
        </div>

      </form>
  </div>
  )
}

export default ManageRole;