import { useState, useEffect } from 'react';
import axios from 'axios';

import type { Team } from '../types/Team';


export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [teamError, setTeamError] = useState<string | null>(null)

  const fetchTeams = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/team`)
      setTeams(res.data.data);
      setTeamError(null);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setTeamError(err.response?.data?.detail ?? 'Something went wrong')
      }
    }
  }

  useEffect(() => { fetchTeams() }, [])

  return { teams, teamError, fetchTeams }
}