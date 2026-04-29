import { useState, useEffect } from 'react';
import axios from 'axios';

import type { Player } from '../types/Player';


export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([])
  const [playerError, setPlayerError] = useState<string | null>(null)

  const fetchPlayers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/player`)
      setPlayers(res.data.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setPlayerError(err.response?.data?.detail ?? 'Something went wrong')
      }
    }
  }

  useEffect(() => { fetchPlayers() }, [])

  return { players, playerError, fetchPlayers }
}