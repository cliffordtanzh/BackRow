import validator from 'validator';
import axios from 'axios';

import { useState } from 'react';

import SuccessMessage from '../general/SuccessMessage';
import ErrorMessage from '../general/ErrorMessage';
import FieldInput from '../general/FieldInput';

import useResponse from '../../hooks/useResponse';

import { type PlayerCreate, DEFAULT_PLAYER_CREATE } from '../../types/PlayerCreate';
import { type Lang } from '../../types/Lang';
import { DEFAULT_RESPONSE } from '../../types/Response';

import headers from '../../assets/headers.json';
import playerHeaders from '../../assets/player_inputs.json';
import './ManageInputs.css'


type PlayerRegistrationProps = {
  lang: Lang,
  onSuccess: () => void
}


function PlayerRegistration ({ lang, onSuccess }: PlayerRegistrationProps) {
  const [error, setError, success, setSuccess] = useResponse();
  const [playerState, setPlayerState] = useState<PlayerCreate>(DEFAULT_PLAYER_CREATE);

  const handleSubmit = (event: React.SubmitEvent) => {
    event.preventDefault();

    if(playerState.playerName === DEFAULT_PLAYER_CREATE.playerName) {
      setError((prev) => ({...prev, message: 'Player name cannot be empty'}));
      setSuccess(DEFAULT_RESPONSE);
      return;
    }

    if (!validator.isEmail(playerState.email)) {
      setError((prev) => ({...prev, message: 'Email is not valid'}));
      setSuccess(DEFAULT_RESPONSE);
      return;
    }

    if(playerState.playerNumber === -1) {
      setError((prev) => ({...prev, message: 'Player number cannot be empty'}));
      setSuccess(DEFAULT_RESPONSE);
      return;
    }

    axios.post(
      `${import.meta.env.VITE_API_URL}/register`, 
      {...playerState}
    ).then((resp) => {
      onSuccess();
      setPlayerState(DEFAULT_PLAYER_CREATE);
      setError(DEFAULT_RESPONSE);
      setSuccess((prev) => ({...prev, message: resp.data.detail}));

    }).catch((resp) => {
      setError((prev) => ({...prev, message: resp.response.data.detail}))
    })
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
                  value={
                    (header['key'] !== 'playerNumber' || playerState.playerNumber !== -1) ? 
                    String(playerState[header['key'] as keyof PlayerCreate]) :
                    ''
                  }
                  setField={(val) => (
                    setPlayerState((prev) => ({...prev, [header['key']]: 
                        header['key'] === 'playerNumber' ? Number(val) : val}
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

export default PlayerRegistration;