import axios from 'axios';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

import type { Lang } from '../types/Lang';
import { type Player } from '../types/Player';
import { type Team } from '../types/Team';
import { type Role } from '../types/Role';
import { type JwtPayload } from '../types/JwtPayload';
import { type ResultQuery } from '../types/ResultQuery';
import { type EventQuery } from '../types/EventQuery';
import { type Result, DEFAULT_RESULT } from '../types/Result';
import { type Response, DEFAULT_RESPONSE } from '../types/Response';
import { type History, DEFAULT_HISTORY } from '../types/History';

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
  History,
  Result,
  React.Dispatch<React.SetStateAction<Result>>
] {

  const [results, setResults] = useState<Result[]>([]);
  const [selectedResult, setSelectedResult] = useState<Result>(DEFAULT_RESULT);
  const [history, setHistory] = useState<History>(DEFAULT_HISTORY);

  const token = localStorage.getItem('Jwt_token')!

  const fetchResult = (payload: ResultQuery) => {
    axios.post(
      `${import.meta.env.VITE_API_URL}/fetch_results`,
      {...payload},
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

  const fetchHistory = (payload: EventQuery) => {
    axios.post(`${import.meta.env.VITE_API_URL}/fetch_events`, payload)
    .then((resp) => {
      setFetchError(DEFAULT_RESPONSE);
      setFetchSuccess((prev) => ({
        ...prev, 
        message: responses[resp.data.detail as keyof typeof responses][lang]
      }));

      setHistory((prev) => ({
        ...prev, 
        events: resp.data.data,
        isPlayerMode: isPlayerMode,
        playerID: selectedPlayer.ID,
        playerName: selectedPlayer.name,
        teamID: selectedTeam.ID,
        teamName: selectedTeam.name,
        youtubeURL: selectedResult.youtubeURL,
        gameName: selectedResult.gameName
      }));
    })
    .catch((resp) => {
      const responseKey: string = (
        resp.response ? resp.response.data.detail.split(': ')[1] : 'prelogin_errorr'
      )
      setFetchError((prev) => ({
        ...prev,
        message: responses[responseKey as keyof typeof responses][lang]
      }));
      setFetchSuccess(DEFAULT_RESPONSE);
    })
  }
  
  useEffect(() => {
    if (token === null) {
      setFetchError((prev) => ({...prev, message: responses['prelogin_fetch_error'][lang]}))
      setFetchSuccess(DEFAULT_RESPONSE)
      
    } else {
      const decoded = jwtDecode<JwtPayload>(token)
      const playerID = decoded['playerID']
      const teamID = decoded['teamID']
      const role: Role = decoded['role']
      setRole(role);
      
      const fetchAll = async () => {
        const resultPayload: ResultQuery = {
          isPlayerMode: isPlayerMode,
          playerID: role === 'player' ? playerID : selectedPlayer.ID,
          teamID: role === 'root' ? selectedTeam.ID : teamID,
        }
        await fetchResult(resultPayload);

        const historyPayload: EventQuery = {
          ID: selectedResult.resultID,
          isPlayerMode: isPlayerMode
        }
        await fetchHistory(historyPayload);
      }
      fetchAll();
    }
  }, [selectedPlayer, selectedTeam, isPlayerMode])

  return [results, history, selectedResult, setSelectedResult]
}