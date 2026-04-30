import { useState } from 'react';
import validator from 'validator';
import axios from 'axios';

import SuccessMessage from '../general/SuccessMessage';
import ErrorMessage from '../general/ErrorMessage';
import FieldInput from '../general/FieldInput';

import useResponse from '../../hooks/useResponse';

import type { Lang } from '../../types/Lang';
import type { PlayerCreate } from '../../types/PlayerCreate';
import { DEFAULT_RESPONSE } from '../../types/Response';

import headers from '../../assets/headers.json';
import playerHeaders from '../../assets/player_inputs.json';

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

  const [error, setError, success, setSuccess] = useResponse();
  const [playerState, setPlayerState] = useState<PlayerCreate>(DEFAULT_PLAYER);

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();

    if(playerState.playerName === DEFAULT_PLAYER.playerName) {
      setError((prev) => ({...prev, message: 'Player name must not be empty'}));
      setSuccess(DEFAULT_RESPONSE);
      return;
    }

    if (!validator.isEmail(playerState.email)) {
      setError((prev) => ({...prev, message: 'Email is not valid'}));
      setSuccess(DEFAULT_RESPONSE);
      return;
    }

    if(playerState.playerNumber === -1) {
      setError((prev) => ({...prev, message: 'Player number must not be empty'}));
      setSuccess(DEFAULT_RESPONSE);
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/register`, 
        {...playerState}
      )
      onSuccess();
      setPlayerState(DEFAULT_PLAYER);
      setError(DEFAULT_RESPONSE);
      setSuccess((prev) => ({...prev, message: 'Request submitted'}));

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
                <FieldInput
                  key={header['key']}
                  password={header['key'] === 'password'}
                  setField={(val) => (
                    setPlayerState((prev) => (
                      {...prev, [header['key']]: 
                        header['key'] === 'playerNumber' ? 
                        Number(val) : 
                        val
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
          {error.message && <ErrorMessage response={error}/>}
          {success.message && <SuccessMessage response={success}/>}
        </div>
      </form>
    </div>
  )
}

export default PlayerManageInputs;