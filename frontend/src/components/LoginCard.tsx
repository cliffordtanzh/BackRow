import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

import SuccessMessage from './SuccessMessage';
import ErrorMessage from './ErrorMessage';

import type { PlayerLogin } from '../types/PlayerLogin';
import type { JwtPayload } from '../types/JwtPayload';

import './LoginCard.css';


type loginCardProps = {
  setJwtToken: React.Dispatch<React.SetStateAction<string | null>>
}


function LoginCard({ setJwtToken }: loginCardProps) {
  const[postError, setPostError] = useState<string | null>(null)
  const[postSuccess, setPostSuccess] = useState<string | null>(null)

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
      setPostError(null);
      setPostSuccess(`Logged in as ${decoded['name']}`)
      setJwtToken(token)

    } catch (error) {
      if (axios.isAxiosError(error)) {
        setPostError(error.response?.data?.detail ?? 'Something went wrong')
        setPostSuccess(null)
      }
    }
  }
 
  return (
    <div className='logincard'>
      <form onSubmit={handleSubmit}>
        
        <div className='logincard-input'>
          <label className='logincard-input__header'>Email</label>
          <input 
            className='logincard-field__input'
            onChange={(event) => (
              setPlayerState((prev) => ({...prev, 'email': event.target.value}))
            )} 
          />
        </div>

        <div className='logincard-input'>
          <label className='logincard-input__header'>Password</label>
          <input 
            className='logincard-field__input'
            type='password'
            onChange={(event) => (
              setPlayerState((prev) => ({...prev, 'password': event.target.value}))
            )} 
          />
        </div>
        
        <div className='logincard-input'>
          <button className='logincard__submit' type='submit'>Login</button>
          {postSuccess && <SuccessMessage success={postSuccess}/>}
          {postError && <ErrorMessage error={postError}/>}
        </div>
          
      </form>
    </div>
  )
}

export default LoginCard