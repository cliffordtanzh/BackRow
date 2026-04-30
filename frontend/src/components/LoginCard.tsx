import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

import ErrorMessage from './ErrorMessage';

import type { Lang } from '../types/Lang';
import type { PlayerLogin } from '../types/PlayerLogin';
import type { JwtPayload } from '../types/JwtPayload';

import headers from '../assets/headers.json';
import './LoginCard.css';


type loginCardProps = {
  lang: Lang,
  setJwtToken: React.Dispatch<React.SetStateAction<string | null>>
}


function LoginCard({ lang, setJwtToken }: loginCardProps) {
  const[postError, setPostError] = useState<string | null>(null)

  const[playerState, setPlayerState] = useState<PlayerLogin>({
    email: '',
    password: '',
  })

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();

    try {
      const payload = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        {...playerState}
      )
      
      const token = payload.data.data
      const decoded: JwtPayload = jwtDecode(token)

      localStorage.setItem("JWT_token", token)
      localStorage.setItem("userName", decoded['name'])

      setPostError(null);
      setJwtToken(token)

    } catch (error) {
      if (axios.isAxiosError(error)) {
        setPostError(error.response?.data?.detail ?? 'Something went wrong')
      }
    }
  }
 
  return (
    <div className='logincard'>
      <form onSubmit={handleSubmit}>
        
        <div className='logincard-input'>
          <label className='logincard-input__header'>{headers['email'][lang]}</label>
          <input 
            className='logincard-field__input'
            onChange={(event) => (
              setPlayerState((prev) => ({...prev, 'email': event.target.value}))
            )} 
          />
        </div>

        <div className='logincard-input'>
          <label className='logincard-input__header'>{headers['password'][lang]}</label>
          <input 
            className='logincard-field__input'
            type='password'
            onChange={(event) => (
              setPlayerState((prev) => ({...prev, 'password': event.target.value}))
            )} 
          />
        </div>
        
        <div className='logincard-input'>
          <button className='logincard__submit' type='submit'>{headers['login_button'][lang]}</button>
          {postError && <ErrorMessage error={postError} fade={true}/>}
        </div>
          
      </form>
    </div>
  )
}

export default LoginCard