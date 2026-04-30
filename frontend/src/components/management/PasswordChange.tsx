import axios from 'axios';
import { useState } from 'react';

import ErrorMessage from '../general/ErrorMessage';
import SuccessMessage from '../general/SuccessMessage';
import FieldInput from '../general/FieldInput';

import useResponse from '../../hooks/useResponse';

import type { Lang } from '../../types/Lang';
import { DEFAULT_RESPONSE } from '../../types/Response';

import headers from '../../assets/headers.json';

import './ManageInputs.css';


type passwordChangeProps = {
  lang: Lang
}


function PasswordChange({ lang }: passwordChangeProps) {
  const [error, setError, success, setSuccess] = useResponse();

  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');

  const handleSubmit = (event: React.SubmitEvent) => {
    event.preventDefault()

    if((oldPassword === '') || (newPassword === '')) {
      setError((prev) => ({...prev, message: 'Password cannot be empty'}))
      return 
    }

    const passwords = {
      old: oldPassword,
      new: newPassword
    }

    const token = localStorage.getItem("JWT_token")
    axios.post(
      `${import.meta.env.VITE_API_URL}/change_password`,
      passwords,
      {headers: {Authorisation: `Bearer ${token}`}}
    )
    .then((resp) => {
      setError(DEFAULT_RESPONSE)
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
          <label className='manage-inputs__label'>
            {headers['old_password'][lang]}
          </label>
          <FieldInput
            setField={setOldPassword}
            password={true}
          />
        </div>

        <div className='manage-inputs__field'>
          <label className='manage-inputs__label'>
            {headers['new_password'][lang]}
          </label>
          <FieldInput
            setField={setNewPassword}
            password={true}
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

export default PasswordChange;