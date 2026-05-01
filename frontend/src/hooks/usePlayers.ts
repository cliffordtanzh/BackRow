import { useState, useEffect } from 'react';
import axios from 'axios';

import { type Player } from '../types/Player';
import { type Response, DEFAULT_RESPONSE } from '../types/Response';


export function usePlayers() {
  const[players, setPlayers] = useState<Player[]>([])
  const[playerError, setPlayersError] = useState<Response>(DEFAULT_RESPONSE);


  const fetchPlayers = () => {
    axios.get(`${import.meta.env.VITE_API_URL}/player`)
    .then((resp) => setPlayers(resp.data.data))
    .catch((resp) => setPlayersError((prev) => ({...prev, message: resp.response.data.detail})))
  }

  useEffect(() => { fetchPlayers() }, [])
  return { players, playerError, fetchPlayers }
}