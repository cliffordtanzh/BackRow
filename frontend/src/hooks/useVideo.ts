import axios from 'axios';
import { useState, useEffect } from 'react';

import { useResponse } from './useResponse';

import { type Lang } from '../types/Lang';
import { type Response, DEFAULT_RESPONSE } from '../types/Response';

import responses from '../assets/responses.json';


function useVideo(lang: Lang ):[
  string,
  React.Dispatch<React.SetStateAction<string>>,
  string,
  React.Dispatch<React.SetStateAction<string>>,
  Response,
  Response,
] {
  const [videoURL, setVideoURL] = useState<string>(() => (
    localStorage.getItem('videoURL') ||
    'https://www.youtube.com/watch?v=xEsQvDWAGHQ&t=310s'
  ));

  const [gameName, setGameName] = useState<string>('');
  const [fetchError, setFetchError, fetchSuccess, setFetchSuccess] = useResponse();

  useEffect(() => { 
    if (!videoURL) {
      return;
    }

    if (!videoURL.includes('youtube.com/watch?v=')) {
      setFetchError((prev) => ({...prev, message: responses['url_input_error'][lang]}))
      setFetchSuccess(DEFAULT_RESPONSE)
      return;
    }

    localStorage.setItem('videoURL', videoURL)

    axios.get(`https://www.youtube.com/oembed?url=${videoURL}&format=json`)
    .then((resp) => {
      setGameName(resp.data.title)
      setFetchError(DEFAULT_RESPONSE)
      setFetchSuccess((prev) => ({...prev, message: responses['title_fetch_success'][lang]}))
    })
    .catch((resp) => {
      if (resp.response.data.detail) {
        const responseKey: string = resp.response.data.detail.split(': ')[1]
        setFetchError((prev) => ({
          ...prev, 
          message: responses[responseKey as keyof typeof responses][lang]
        }))
      }
      else {
        setFetchError((prev) => ({
          ...prev,
          message: 'Something went wrong'
        }))
      }
      setGameName('');
      setFetchSuccess(DEFAULT_RESPONSE)
    })

  }, [videoURL])

  return [videoURL, setVideoURL, gameName, setGameName, fetchError, fetchSuccess]
}

export default useVideo;