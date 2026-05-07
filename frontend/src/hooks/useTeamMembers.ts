import axios from "axios";
import { useEffect, useState } from "react";

import { type Response, DEFAULT_RESPONSE } from "../types/Response";
import { type Lang } from "../types/Lang";
import { type Team } from "../types/Team";
import { type TeamMember } from "../types/TeamMember";
import { useResponse } from "./useResponse";

import responses from '../assets/responses.json';


export function useTeamMembers(lang: Lang, team: Team): [ 
  TeamMember[],
  Response,
  Response,
] {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [success, setSuccess, error, setError] = useResponse()
  const token = localStorage.getItem('jwtToken')

  const fetchTeamMembers = () => {
    axios.post(
      '/fetch_team_members', 
      {teamID: team.ID}, 
      {headers: {Authorisation: `Bearer ${token}`}}
    )
    .then((resp) => {
      setTeamMembers(resp.data.data)
    })
    .catch((resp) => {
      if (resp.response.data.detail) {
          const responseKey = resp.response.data.detail
          if (responseKey instanceof String) {
            setError((prev) => ({
              ...prev, 
              message: responses[responseKey as keyof typeof responses][lang]
            }))
          } else {
            setError((prev) => ({
              ...prev, 
              message: responseKey.msg
            }))
          }
        }
        else {
          setError((prev) => ({
            ...prev,
            message: 'Something went wrong'
          }))
        }
        setSuccess(DEFAULT_RESPONSE);
    })
  }

  useEffect(() => {
    fetchTeamMembers()
  }, [team])

  return [ teamMembers, success, error ]
}