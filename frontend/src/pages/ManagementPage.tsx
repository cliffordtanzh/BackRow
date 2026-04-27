import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import LanguageSelector from "../components/LanguageSelector";
import NavButton from "../components/NavButton";
import TeamManageInputs from "../components/TeamManageInputs";
import PlayerManageInputs from '../components/PlayerManageInputs';

import type { Lang } from "../types/Lang";
import type { Team } from "../types/Team";
import type { Player } from "../types/Player";

import headers from '../assets/headers.json';

import './ManagementPage.css';


function ManagementPage() {
  const[lang, setLang] = useState<Lang>('en');
  const navigate = useNavigate();

  const[teams, setTeams] = useState<Team[]>([]);
  const[players, setPlayers] = useState<Player[]>([]);

  const[selectedTeam, setSelectedTeam] = useState<Team>({
    teamID: 0,
    teamName: 'SKVB',
  });
  const[selectedPlayer, setSelectedPlayer] = useState<Player>({
    playerID: 0,
    playerName: 'Cliffy',
    playerNumber: 7,
    teamName: 'SKVB',
  });

  // Fetches
  const fetchTeams = async () => {
    const teams = await axios.get('http://localhost:8000/teams');
    setTeams(teams.data);
  }

  const fetchPlayers = async () => {
    const players = await axios.get('http://localhost:8000/players');
    setPlayers(players.data);
  }

  // Hooks
  useEffect(() => {fetchTeams(), fetchPlayers()}, [])

  return (
    <div className='manage-shell'>
      <div className='manage-shell__controls'>
        <LanguageSelector
          lang={lang}
          setLang={setLang}
        />
        <NavButton
          lang={lang}
          navigate={() => navigate('/')}
          buttonHeader={headers['statistics_button']}
        />
      </div>

      <div className='manage-shell__main'>

        <div className='manage-shell__panel'>
          <div className='manage-shell__panel-title'>Player Entry</div>
          <PlayerManageInputs
            lang={lang}
          />
        </div>

        <div className='manage-shell__panel'>
          <div className='manage-shell__panel-title'>Team Entry</div>
            <TeamManageInputs
              lang={lang}
            />
        </div>
      </div>
            
    </div>
  )
}

export default ManagementPage;