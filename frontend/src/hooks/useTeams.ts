import { useState, useEffect } from 'react';
import axios from 'axios';

import { type Team } from '../types/Team';
import { type Response, DEFAULT_RESPONSE } from '../types/Response';


export function useTeams() {
  const[teams, setTeams] = useState<Team[]>([])
  const[teamError, setTeamsError] = useState<Response>(DEFAULT_RESPONSE);

  const fetchTeams = () => {
    axios.get(`${import.meta.env.VITE_API_URL}/team`)
    .then((resp) => setTeams(resp.data.data))
    .catch((resp) => setTeamsError((prev) => ({...prev, message: resp.response.data.detail})))
  }

  useEffect(() => { fetchTeams() }, [])
  return { teams, teamError, fetchTeams }
}