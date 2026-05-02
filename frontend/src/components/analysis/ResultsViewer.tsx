import axios from 'axios';
import { useEffect, useState } from 'react';

import Selector from '../general/Selector';

import { useEntity } from '../../hooks/useEntity';
import { useResponse } from '../../hooks/useResponse';

import { type Results } from '../../types/Results';
import { type Lang } from '../../types/Lang';
import { type ResultsQuery } from '../../types/ResultsQuery';
import { type Role, DEFAULT_ROLE } from '../../types/Role'
import { type JwtPayload } from '../../types/JwtPayload';

import { jwtDecode } from 'jwt-decode';
import { DEFAULT_RESPONSE } from '../../types/Response';

import responses from '../../assets/responses.json'
import './ResultsViewer.css'


type ResultsViewerProps = {
  lang: Lang
  isPlayerMode: boolean
}


function ResultsViewer({ lang, isPlayerMode }: ResultsViewerProps) {

  const [
    teams, 
    selectedTeam, 
    setSelectedTeam, 
  ] = useEntity(lang, 'team');
  
  const [
    players, 
    selectedPlayer, 
    setSelectedPlayer, 
  ] = useEntity(lang, 'player');
  
  const [results, setResults] = useState<Results[]>([]);
  const [role, setRole] = useState<Role>(DEFAULT_ROLE);
  const [fetchSuccess, setFetchSuccess, fetchError, setFetchError] = useResponse();

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
      .then((resp) => (setResults(resp.data.data)))
      .catch((resp) => {
        const responseKey: string = resp.response.data.detail.split(': ')[1]
        setFetchError((prev) => ({
          ...prev, 
          message: responses[responseKey as keyof typeof responses][lang]
        }))
      })
    }
  }, [selectedPlayer, selectedTeam])

  console.log(history)

  return (
    <div>
      <div className='selector-bar'>
        <div>
          {
            ['root', 'manager'].includes(role) && 
              <div>
                <div className='selector-label'>
                  Player Name
                </div>
                <Selector
                  items={players}
                  selected={selectedPlayer}
                  setSelected={setSelectedPlayer}
                  getID={(player) => player.ID}
                  getName={(player) => player.name}
                />
              </div>
          }
        </div>

        <div>
          {
            ['root'].includes(role) && 
              <div>
                <div className='selector-label'>
                  Team Name
                </div>
                <Selector
                  items={teams}
                  selected={selectedTeam}
                  setSelected={setSelectedTeam}
                  getID={(team) => team.ID}
                  getName={(team) => team.name}
                />
              </div>
          }
        </div>
      </div>

      <div className='results-viewer'>
        {
          results.map((res: Results) => {
            return (
              <div className='result-card'>
                
                <div>
                  <div className='result-title'>
                    {res.gameName}
                  </div>
                  <div className='result-url'>
                    {res.youtubeURL}
                  </div>
                </div>

                <div className='result-card__stats'>
                  <div className='stats-won'>
                    <div className='result-title'>
                      Points Won
                    </div>
                    <div className='result-url'>
                      20
                    </div>
                  </div>

                  <div className='stats-lost'>
                    <div className='result-title'>
                      Points Lost
                    </div>
                    <div className='result-url'>
                      3
                    </div>
                  </div>

                </div>
              </div>
            )
          })
        }
      </div>

    </div>
  )
}

export default ResultsViewer;