import axios from "axios";
import { useState, useEffect } from "react";

import { useResponse } from "../hooks/useResponse";

import { type ResultQuery } from "../types/ResultQuery";
import { type Result } from "../types/Result";
import { type Lang } from "../types/Lang";
import { type Response, DEFAULT_RESPONSE } from "../types/Response";

import responses from '../assets/responses.json'


function useResults(
  lang: Lang,
  teamID: number,
  playerID: number,
  isPlayerMode: boolean
): [
  Result[],
  Response,
  Response,
] {

  const token = localStorage.getItem('jwtToken')

  const [results, setResults] = useState<Result[]>([]);
  const [fetchSuccess, setFetchSuccess, fetchError, setFetchError] = useResponse();

  useEffect(() => {
    let isCurrent = true;

    const payload: ResultQuery =  {
      playerID: playerID,
      teamID: teamID,
      isPlayerMode: isPlayerMode,
    }

    axios.post(
      `${import.meta.env.VITE_API_URL}/fetch_results`, 
      payload,
      {headers: {Authorisation: `Bearer ${token}`}}
    )
  
    .then((resp) => {
      if (!isCurrent) {
        return;
      }

      setResults(resp.data.data)
      setFetchError(DEFAULT_RESPONSE);
      setFetchSuccess((prev) => ({...prev, message: resp.data.detail}))
    })
  
    .catch((resp) => {
      if (!isCurrent) {
        return;
      }

      if (resp.response.data.detail) {
        const responseKey = resp.response.data.detail
        setFetchError((prev) => ({
          ...prev, 
          message: responses[responseKey as keyof typeof responses][lang]}
        ))
      }
      else {
        setFetchError((prev) => ({
          ...prev,
          message: 'Something went wrong'
        }))
      }
      setFetchSuccess(DEFAULT_RESPONSE)
    })

    return () => {
      isCurrent = false;
    }
  }, [teamID, playerID, isPlayerMode, lang, token])

  return [results, fetchSuccess, fetchError]
}

export default useResults;