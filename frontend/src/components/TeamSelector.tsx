import type { Team } from '../types/Team.ts';

import './TeamSelector.css'


type TeamSelectorProps = {
  teams: Team[],
  selectedTeam: Team,
  setSelectedTeam: React.Dispatch<React.SetStateAction<Team>>,
}


function TeamSelector({
  teams,
  selectedTeam,
  setSelectedTeam, 
}: TeamSelectorProps) {
  const updateTeamName = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const teamName = event.target.value;
    const selectedTeam = teams.find((team) => team.teamName === teamName);
    if (selectedTeam) {
      setSelectedTeam(selectedTeam);
    }
  }

  return (
    <div className='team-selector'>
      <select className='team-selector select'
        value={selectedTeam.teamName}
        onChange={updateTeamName}
      >
        {
          teams.map(({teamID, teamName}: Team) => (
            <option 
              key={teamID} 
              value={teamName}
            >{teamName}</option>
          ))
        }
      </select>
    </div>
  )
}

export default TeamSelector;