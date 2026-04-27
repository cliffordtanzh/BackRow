import { useState, useEffect } from 'react';
import axios from 'axios';

import TeamSelector from './TeamSelector';

import type { Lang } from '../types/Lang';
import type { Player } from '../types/Player';
import type { Team } from '../types/Team';

import playerHeaders from '../assets/player_inputs.json';

import './ManageInputs.css'


type PlayerManageInputsProps = {
  lang: Lang
}


function PlayerManageInputs ({ 
  lang,
}: PlayerManageInputsProps) {
  const[teams, setTeams] = useState<Team[]>([])

  const[team, setSelectedTeam] = useState<Team>({
    teamID: 0,
    teamName: 'SKVB'
  })
  const[playerState, setPlayerState] = useState<Player>({
    playerID: 0,
    playerName: 'Name',
    playerNumber: 7,
    teamName: team.teamName,
  });

  function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault();
    axios.post('http://localhost:8000/players', playerState)
  }

  // Fetches
  const fetchTeams = async () => {
    const teams = await axios.get('http://localhost:8000/teams');
    setTeams(teams.data);
  }

  // Hooks
  useEffect(() => {fetchTeams()}, [])

  return (
    <div className='manage-inputs'>
      <form onSubmit={handleSubmit}>

        {
          playerHeaders.map((header) => (
            header['key'] === 'teamName' ? (
              <div 
                className='manage-inputs__field'
                key='teamName'
              >
                <label className='manage-inputs__label'>Team Name</label>
                <TeamSelector 
                  teams={teams}
                  selectedTeam={team}
                  setSelectedTeam={setSelectedTeam}
                />
              </div>
            ) :
            <div 
              className='manage-inputs__field'
              key={header['key']}
            >
              <label className='manage-inputs__label'>{header[lang]}</label>
              <input className='field-input'
                onChange={(event) => (
                  setPlayerState((prev) => ({...prev, [header['key']]: event.target.value}))
                )}
              />
            </div>
          ))
        }

        <button className='manage-inputs__submit' type='submit'>Submit</button>
      </form>
    </div>
  )
}

export default PlayerManageInputs;