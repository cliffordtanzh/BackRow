import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

import ErrorMessage from '../general/ErrorMessage';
import SuccessMessage from '../general/SuccessMessage';
import FieldInput from '../general/FieldInput';

import useResponse from '../../hooks/useResponse';

import type { Lang } from '../../types/Lang';
import type { PlayerLogin } from '../../types/PlayerLogin';
import type { JwtPayload } from '../../types/JwtPayload';
import { DEFAULT_RESPONSE } from '../../types/Response';

import headers from '../../assets/headers.json';
import './ManageInputs.css';


type loginCardProps = {
  lang: Lang,
  setJwtToken: React.Dispatch<React.SetStateAction<string | null>>
}


function LoginCard({ lang, setJwtToken }: loginCardProps) {
  const [error, setError, success, setSuccess] = useResponse();

  const [playerState, setPlayerState] = useState<PlayerLogin>({
    email: '',
    password: '',
  })

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();

    if ((playerState.email === '') || (playerState.password === '')) {
      setError((prev) => ({...prev, message: 'Email and password must be provided'}));
      setSuccess(DEFAULT_RESPONSE);
      return;
    }

    axios.post(
      `${import.meta.env.VITE_API_URL}/login`,
      {...playerState}
    )
    .then((resp) => {
      const token = resp.data.data
      const decoded: JwtPayload = jwtDecode(token)
      
      localStorage.setItem("JWT_token", token)
      localStorage.setItem("userName", decoded['playerName'])
  
      setError(DEFAULT_RESPONSE);
      setSuccess((prev) => ({...prev, message: resp.data.detail}))
      setJwtToken(token)
    })
    .catch((resp) => setError((prev) => ({...prev, message: resp.response.data.detail})))
  }
 
  return (
    <div className='manage-inputs'>
      <form onSubmit={handleSubmit}>
        
        <div className='manage-inputs__field'>
          <label className='manage-inputs__label'>
            {headers['email'][lang]}
          </label>
          <FieldInput
            setField={(val) => setPlayerState((prev) => ({...prev, email: val}))} 
          />
        </div>

        <div className='manage-inputs__field'>
          <label className='manage-inputs__label'>
            {headers['password'][lang]}
          </label>
          <FieldInput
            password={true}
            setField={(val) => setPlayerState((prev) => ({...prev, password: val}))}
          />
        </div>
        
        <div className='manage-inputs__field'>
          <button 
            className='manage-inputs__submit' 
            type='submit'
          >
            {headers['login_button'][lang]}
          </button>
          {error.message && <ErrorMessage response={error}/>}
          {success.message && <SuccessMessage response={success}/>}
        </div>

      </form>
    </div>
  )
}

export default LoginCard