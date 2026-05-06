import axios from 'axios';

import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';

import ErrorMessage from '../general/ErrorMessage';
import SuccessMessage from '../general/SuccessMessage';
import FieldInput from '../general/FieldInput';

import { useResponse } from '../../hooks/useResponse';

import { DEFAULT_PLAYER_LOGIN, type PlayerLogin } from '../../types/PlayerLogin';
import { DEFAULT_RESPONSE } from '../../types/Response';
import { type Lang } from '../../types/Lang';
import { type JwtPayload } from '../../types/JwtPayload';

import headers from '../../assets/headers.json';
import responses from '../../assets/responses.json';
import './ManageInputs.css';


type loginCardProps = {
  lang: Lang,
  setJwtToken: React.Dispatch<React.SetStateAction<string | null>>,
  logout: () => void
}


function LoginCard({ lang, setJwtToken, logout }: loginCardProps) {

  const [error, setError, success, setSuccess] = useResponse();
  const [playerState, setPlayerState] = useState<PlayerLogin>(DEFAULT_PLAYER_LOGIN)

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();

    if ((playerState.email === '') || (playerState.password === '')) {
      setError((prev) => ({...prev, message: responses['empty_login_details_error'][lang]}));
      setSuccess(DEFAULT_RESPONSE);
      return;
    }

    axios.post(
      `${import.meta.env.VITE_API_URL}/login`,
      {...playerState}
    )
    .then((resp) => {
      setError(DEFAULT_RESPONSE);
      setSuccess((prev) => ({
        ...prev, 
        message: responses[resp.data.detail as keyof typeof responses][lang]
      }));

      logout();

      const token = resp.data.data
      localStorage.setItem('jwtToken', token)      

      setJwtToken(token);
      setPlayerState(DEFAULT_PLAYER_LOGIN);
    })

    .catch((resp) => {
      if (resp.response.data.detail) {
        const responseKey: string = resp.response.data.detail.split(': ')[1]
        setError((prev) => ({
          ...prev, 
          message: responses[responseKey as keyof typeof responses][lang]
        }))
      }
      else {
        setError((prev) => ({
          ...prev,
          message: 'Something went wrong'
        }))
      }
    })
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
            value={playerState.email}
          />
        </div>

        <div className='manage-inputs__field'>
          <label className='manage-inputs__label'>
            {headers['password'][lang]}
          </label>
          <FieldInput
            setField={(val) => setPlayerState((prev) => ({...prev, password: val}))}
            password={true}
            value={playerState.password}
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