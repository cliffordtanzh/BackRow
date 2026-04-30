import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

import useResponse from '../hooks/useResponse';

import ErrorMessage from './general/ErrorMessage';
import SuccessMessage from './general/ErrorMessage';
import FieldInput from './general/FieldInput';

import type { Lang } from '../types/Lang';
import type { PlayerLogin } from '../types/PlayerLogin';
import type { JwtPayload } from '../types/JwtPayload';
import type { Response } from '../types/Response';
import { DEFAULT_RESPONSE } from '../types/Response';

import headers from '../assets/headers.json';
import './LoginCard.css';


type loginCardProps = {
  lang: Lang,
  setJwtToken: React.Dispatch<React.SetStateAction<string | null>>
}


function LoginCard({ lang, setJwtToken }: loginCardProps) {
  const [success, setSuccess, error, setError] = useResponse();

  const[playerState, setPlayerState] = useState<PlayerLogin>({
    email: '',
    password: '',
  })

  const handleSubmit = (event: React.SubmitEvent) => {
    event.preventDefault();

    if((playerState.email === '') || (playerState.password)) {
      setError((prev) => ({...prev, message: 'Email or password cannot be empty'}))
      setSuccess(DEFAULT_RESPONSE)
    }

    axios.post(
      `${import.meta.env.VITE_API_URL}/login`,
      {...playerState}
    ).then((resp) => {
      const token = resp.data.data
      const decoded: JwtPayload = jwtDecode(token)

      localStorage.setItem("JWT_token", token)
      localStorage.setItem("userName", decoded['playerName'])

      setError(DEFAULT_RESPONSE);
      setSuccess((prev) => ({...prev, message: resp.data.detail}))
      setJwtToken(token)

    }).catch((resp) => {
      setError((prev) => ({...prev, message: resp.response.data.detail}))
      setSuccess(DEFAULT_RESPONSE)
    })
  }
 
  return (
    <div className='logincard'>
      <form onSubmit={handleSubmit}>
        
        <div className='logincard-input'>
          <label className='logincard-input__header'>{headers['email'][lang]}</label>
          <FieldInput
            setField={(value) => (
              setPlayerState((prev) => ({...prev, 'email': value}))
            )} 
          />
        </div>

        <div className='logincard-input'>
          <label className='logincard-input__header'>{headers['password'][lang]}</label>
          <FieldInput
            setField={(value) => (
              setPlayerState((prev) => ({...prev, 'password': value}))
            )} 
            password={true}
          />
        </div>
        
        <div className='logincard-input'>
          <button className='logincard__submit' type='submit'>{headers['login_button'][lang]}</button>
          {error.message && <ErrorMessage response={error}/>}
          {success.message && <SuccessMessage response={success}/>}
        </div>
          
      </form>
    </div>
  )
}

export default LoginCard