import validator from 'validator';
import axios from 'axios';

import { useState } from 'react';

import SuccessMessage from '../general/SuccessMessage';
import ErrorMessage from '../general/ErrorMessage';
import FieldInput from '../general/FieldInput';

import { useResponse } from '../../hooks/useResponse';

import { type PlayerCreate, DEFAULT_PLAYER_CREATE } from '../../types/PlayerCreate';
import { type Lang } from '../../types/Lang';
import { DEFAULT_RESPONSE } from '../../types/Response';

import headers from '../../assets/headers.json';
import playerHeaders from '../../assets/player_inputs.json';
import responses from '../../assets/responses.json';
import './ManageInputs.css'


type PlayerRegistrationProps = {
  lang: Lang,
  onSuccess: () => void
}


function PlayerRegistration ({ lang, onSuccess }: PlayerRegistrationProps) {
  const [error, setError, success, setSuccess] = useResponse();
  const [playerState, setPlayerState] = useState<PlayerCreate>(DEFAULT_PLAYER_CREATE);

  const [playerNumberStr, setPlayerNumberStr] = useState<string>('');

  const handleSubmit = (event: React.SubmitEvent) => {
    event.preventDefault();

    if(playerState.name === DEFAULT_PLAYER_CREATE.name) {
      setError((prev) => ({...prev, message: responses['empty_player_name_error'][lang]}));
      setSuccess(DEFAULT_RESPONSE);
      return;
    }

    if (!validator.isEmail(playerState.email)) {
      setError((prev) => ({...prev, message: responses['invalid_email_error'][lang]}));
      setSuccess(DEFAULT_RESPONSE);
      return;
    }

    if (playerState.password === '') {
      setError((prev) => ({...prev, message: responses['empty_password_error'][lang]}));
      setSuccess(DEFAULT_RESPONSE);
      return;
    }

    if (isNaN(Number(playerNumberStr))) {
      setError((prev) => ({...prev, message: responses['empty_player_number_error'][lang]}));
      setSuccess(DEFAULT_RESPONSE);
      return;
    }

    setPlayerState((prev) => ({...prev, playerNumber: Number(playerNumberStr)}))

    axios.post(
      `${import.meta.env.VITE_API_URL}/register`, 
      {...playerState}
    ).then((resp) => {
      onSuccess();
      setPlayerState(DEFAULT_PLAYER_CREATE);
      
      setError(DEFAULT_RESPONSE);
      setSuccess((prev) => ({
        ...prev, 
        message: responses[resp.data.detail as keyof typeof responses][lang]
      }));

    }).catch((resp) => {
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
      setSuccess(DEFAULT_RESPONSE)
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
                    header['key'] !== 'playerNumber' ? 
                    String(playerState[header['key'] as keyof PlayerCreate]) :
                    playerNumberStr
                  }
                  setField={(val) => (
                    header['key'] !== 'playerNumber' ?
                      setPlayerState((prev) => ({...prev, [header['key']]: 
                          header['key'] === 'playerNumber' ? Number(playerNumberStr) : val}
                      ))
                    : setPlayerNumberStr(val)
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