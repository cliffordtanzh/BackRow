import { useState, useEffect } from 'react';
import axios from 'axios';

import ModeSelector from './components/ModeSelector';
import TeamSelector from './components/TeamSelector';
import TeamInputs from './components/TeamInputs.tsx';

import type { Team } from './types/Team.ts';
import './App.css';


function App() {
  // All states needed
  const[isPlayerMode, setIsPlayerMode] = useState<boolean>(true);
  const[teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team>({
    team_id: 0,
    team_name: "Select a Team"
  })

  // Fetches
  const fetchTeams = async () => {
    const teams = await axios.get("http://localhost:8000/teams");
    setTeams(teams.data);
  }

  // Hooks
  useEffect(() => {
    fetchTeams();
  }, [])


  return (
    <div className='team-page'>
      <div>
        <ModeSelector
          isPlayerMode={isPlayerMode}
          setIsPlayerMode={setIsPlayerMode}
          />
      </div>
      <div>
        <TeamSelector
          teams={teams}
          selectedTeam={selectedTeam}
          setSelectedTeam={setSelectedTeam}
        ></TeamSelector>
      </div>
      <TeamInputs></TeamInputs>
    </div>
  );
}

export default App;