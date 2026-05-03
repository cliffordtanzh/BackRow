import axios from 'axios';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

import type { Lang } from '../types/Lang';
import { type Player } from '../types/Player';
import { type Team } from '../types/Team';
import { type Role } from '../types/Role';
import { type JwtPayload } from '../types/JwtPayload';
import { type ResultsQuery } from '../types/ResultsQuery';
import { type Result, DEFAULT_RESULT } from '../types/Result';
import { type Response, DEFAULT_RESPONSE } from '../types/Response';

import responses from '../assets/responses.json'


export function useResults(
  lang: Lang,
  isPlayerMode: boolean,
  selectedPlayer: Player,
  selectedTeam: Team,
  setRole: React.Dispatch<React.SetStateAction<Role>>,
  setFetchSuccess: React.Dispatch<React.SetStateAction<Response>>,
  setFetchError: React.Dispatch<React.SetStateAction<Response>>,
): [
  Result[],
  Result,
  React.Dispatch<React.SetStateAction<Result>>
] {

  const [results, setResults] = useState<Result[]>([]);
  const [selectedResult, setSelectedResult] = useState<Result>(DEFAULT_RESULT);

  const token = localStorage.getItem('Jwt_token')!
  const decoded = jwtDecode<JwtPayload>(token)

  useEffect(() => {
    if (token === null) {
      setFetchError((prev) => ({...prev, message: responses['prelogin_fetch_error'][lang]}))
      setFetchSuccess(DEFAULT_RESPONSE)
      
    } else {
      const playerID = decoded['playerID']
      const teamID = decoded['teamID']
      const role: Role = decoded['role']
      
      const newQuery: ResultsQuery = {
        isPlayerMode: isPlayerMode,
        playerID: role === 'player' ? playerID : selectedPlayer.ID,
        teamID: role === 'root' ? selectedTeam.ID : teamID,
      }

      setRole(role);

      axios.post(
        `${import.meta.env.VITE_API_URL}/fetch_results`,
        {...newQuery},
        {headers: {Authorisation: `Bearer ${token}`}}
      )
      .then((resp) => {
        setResults(resp.data.data)
        setSelectedResult(resp.data.data[0])
      })
      .catch((resp) => {
        const responseKey: string = resp.response.data.detail.split(': ')[1]
        setFetchError((prev) => ({
          ...prev, 
          message: responses[responseKey as keyof typeof responses][lang]
        }))
      })
    }
  }, [selectedPlayer, selectedTeam, isPlayerMode])

  return [results, selectedResult, setSelectedResult]
}