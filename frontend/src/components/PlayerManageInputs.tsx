import { useState } from 'react';
import validator from 'validator';
import axios from 'axios';

import SuccessMessage from './SuccessMessage';
import ErrorMessage from './ErrorMessage';

import type { Lang } from '../types/Lang';
import type { PlayerCreate } from '../types/PlayerCreate';

import headers from '../assets/headers.json';
import playerHeaders from '../assets/player_inputs.json';

import './ManageInputs.css'


type PlayerManageInputsProps = {
  lang: Lang
  onSuccess: () => void
}

const DEFAULT_PLAYER: PlayerCreate = {
  playerName: '', 
  playerNumber: -1, 
  email: '', 
  password: ''
}


function PlayerManageInputs ({ 
  lang,
  onSuccess
}: PlayerManageInputsProps) {

  const[error, setError] = useState<string | null>(null);
  const[success, setSuccess] = useState<string | null>(null);
  const[playerState, setPlayerState] = useState<PlayerCreate>(DEFAULT_PLAYER);

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();

    if(playerState.playerName === DEFAULT_PLAYER.playerName) {
      setError('Player name must not be empty');
      setSuccess(null);
      return;
    }

    if (!validator.isEmail(playerState.email)) {
      setError('Email is not valid');
      setSuccess(null);
      return;
    }

    if(playerState.playerNumber === -1) {
      setError('Player number must not be empty');
      setSuccess(null);
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/register`, 
        {...playerState}
      )
      onSuccess();
      setPlayerState(DEFAULT_PLAYER);
      setError(null);
      setSuccess("Request Sent");

    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.detail ?? 'Something went wrong')
      }

    }
  }

  return (
    <div className='manage-inputs'>
      <form onSubmit={handleSubmit}>

        {
          playerHeaders.map((header) => (
            (header['key'] !== 'teamName') && (
              <div 
                className='manage-inputs__field'
                key={header['key']}
              >
                <label className='manage-inputs__label'>{header[lang]}</label>
                <input 
                  className='field-input'
                  type={header['key'] === 'password' ? 'password' : 'text'}
                  value={
                    ((header['key'] === 'playerNumber') && (playerState['playerNumber'] < 1)) 
                    ? '' : String(playerState[header['key'] as keyof PlayerCreate])
                  }
                  onChange={(event) => (
                    setPlayerState((prev) => (
                      {...prev, [header['key']]: 
                        header['key'] === 'playerNumber' ? 
                        Number(event.target.value) : 
                        event.target.value
                      }
                    ))
                  )}
                />
              </div>
            ))
          )
        }

        <div className='manage-inputs__field'>
          <button className='manage-inputs__submit' type='submit'>
            {headers['manage_submit_button'][lang]}
          </button>
          {error && <ErrorMessage error={error}/>}
          {success && <SuccessMessage success={success}/>}
        </div>
      </form>
    </div>
  )
}

export default PlayerManageInputs;