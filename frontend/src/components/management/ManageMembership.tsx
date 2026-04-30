import axios from 'axios';

import SuccessMessage from '../general/SuccessMessage';
import ErrorMessage from '../general/ErrorMessage';
import Selector from '../general/Selector';

import useResponse from '../../hooks/useResponse';

import type { Lang } from '../../types/Lang';
import type { Membership } from '../../types/Membership';
import type { Role } from '../../types/Role';
import { DEFAULT_RESPONSE } from '../../types/Response';

import headers from '../../assets/headers.json';
import membershipHeaders from '../../assets/membership_inputs.json';

import './ManageInputs.css'


type manageRoleProps = {
  lang: Lang
  chooseProps: (header: string) => any
  setAuthorisation: React.Dispatch<React.SetStateAction<Role>>
}


function ManageRole({ 
  lang,
  chooseProps,
  setAuthorisation,
}: manageRoleProps) {

  const [error, setError, success, setSuccess] = useResponse();

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

    const token = localStorage.getItem('JWT_token')
    axios.post(
      `${import.meta.env.VITE_API_URL}/update_membership`, 
      payload,
      {headers: {Authorisation: `Bearer ${token}`}}
    )
    .then((resp) => {
      setSuccess((prev) => ({...prev, message: resp.data.detail}))
      setError(DEFAULT_RESPONSE)
      setAuthorisation(payload.role);
    })
    .catch((resp) => {
      setSuccess(DEFAULT_RESPONSE)
      setError((prev) => ({...prev, message: resp.response.data.detail}))
    })
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
          {error.message && <ErrorMessage response={error}/>}
          {success.message && <SuccessMessage response={success}/>}
        </div>

      </form>
  </div>
  )
}

export default ManageRole;