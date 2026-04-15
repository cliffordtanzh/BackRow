import type { Team } from '../types/Team.ts';

import '../components/TeamSelector.css'


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
    const team_name = event.target.value;
    const selected_team = teams.find((t) => t.team_name === team_name);
    if (selected_team) {
      setSelectedTeam(selected_team);
    }
  }

  return (
    <div className='team-selector'>
      <select className='team-selector__label'
        value={selectedTeam.team_name}
        onChange={updateTeamName}
      >
        {
          (teams.map((t) => <option 
          key={t.team_id} 
          value={t.team_name}
          ><p className='team-selector__select'>{t.team_name}</p>
          </option>))
        }
      </select>
    </div>
  )
}

export default TeamSelector;