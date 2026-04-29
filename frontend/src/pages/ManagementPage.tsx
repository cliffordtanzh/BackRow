import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import { usePlayers } from '../hooks/usePlayers';
import { useTeams } from '../hooks/useTeams';

import LanguageSelector from '../components/LanguageSelector';
import NavButton from '../components/NavButton';
import ErrorMessage from '../components/ErrorMessage';
import GoodLuckButton from '../components/GoodLuckButton';
import TeamManageInputs from '../components/TeamManageInputs';
import PlayerManageInputs from '../components/PlayerManageInputs';
import LoginCard from '../components/LoginCard';
import ManageRole from '../components/ManageRole';

import type { Lang } from '../types/Lang';
import type { Player } from '../types/Player';
import type { Team } from '../types/Team';
import type { Role } from '../types/Role';
import type { JwtPayload } from '../types/JwtPayload';

import headers from '../assets/headers.json';

import './ManagementPage.css';


function ManagementPage() {
  const[lang, setLang] = useState<Lang>('en');
  const navigate = useNavigate();

  const[jwtToken, setJwtToken] = useState<string | null>(null);
  const[isAuthorised, setIsAuthorised] = useState<boolean>(false);

  const[selectedPlayer, setSelectedPlayer] = useState<Player>({
    playerID: 0,
    playerName: '',
    playerNumber: 0,
    email: '',
    isVerified: false,
  })

  const[selectedTeam, setSelectedTeam] = useState<Team>({
    teamID: 0,
    teamName: ''
  })

  const[selectedRole, setSelectedRole] = useState<Role>({
    playerID: 0,
    teamID: 0,
    role: 'player'
  })

  
  const {players, playerError, fetchPlayers} = usePlayers();
  const {teams, teamError, fetchTeams} = useTeams();
  const roles = [
    { playerID: 0, teamID: 0, role: 'player' },
    { playerID: 0, teamID: 0, role: 'manager' },
    { playerID: 0, teamID: 0, role: 'root' },
  ]

  const allErrors = [playerError, teamError];
  const hasError = allErrors.reduce((a, b) => {
    if ((a === null) || (b === null)) {
      return null
    }

    return a || b;
  })

  const chooseProps = (header: string) => {
    return header === 'player' ? {
      items: players,
      selected: selectedPlayer,
      setSelected: setSelectedPlayer,
      getID: (item: Player) => `${header}_${item.playerID}`,
      getName: (item: Player) => (item.playerName),
    } : {
      items: roles,
      selected: selectedRole,
      setSelected: setSelectedRole,
      getID: (item: Role) => `${header}_${item.role}`,
      getName: (item: Role) => (item.role.charAt(0).toUpperCase() + item.role.slice(1)),
    }
  }

  const checkAuthorised = () => {
    const token = localStorage.getItem('JWT_token')
    if(token === null) {
      return false;
    }

    const decoded = jwtDecode<JwtPayload>(token)
    if(decoded['role'] === 'player') {
      return false;
    }

    return true;
  }

  useEffect(() => {
    if(players.length > 0) {
      setSelectedPlayer(players[0])
    }
  }, [players])

  useEffect(() => {
    if(teams.length > 0) {
      setSelectedTeam(teams[0])
    }
  }, [teams])

  useEffect(() => {
    setIsAuthorised(checkAuthorised())
  }, [jwtToken])

  return (
    <div className='manage-shell'>
      <div className='manage-shell__top'>
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

        <div className='manage-shell__error'>
          {hasError ? allErrors.map((error: string | null) => (
            error && <ErrorMessage key={error} error={error}/>
          )) : <GoodLuckButton/>}
        </div>
      </div>

      <div className='manage-shell__bot'>

        <div className='manage-shell__panel'>
          <div className='manage-inputs__title'>
            {headers['login'][lang]}
          </div>
          <LoginCard
            setJwtToken={setJwtToken}
          />

          <div className='manage-inputs__title'>
            {headers['team_management'][lang]}
          </div>
          <TeamManageInputs
            lang={lang}
            onSuccess={fetchTeams}
          />
        </div>

        <div className={`manage-shell__panel-center ${isAuthorised ? '' : 'blurred'}`}>
          <div className='manage-inputs__title'>
            {headers['player_management'][lang]}
          </div>
          <PlayerManageInputs
            lang={lang}
            onSuccess={fetchPlayers}
          />

          <div className='manage-inputs__title'>
            {headers['role_management'][lang]}
          </div>
          <ManageRole
            lang={lang}
            chooseProps={chooseProps}
          />
          
        </div>

      </div>
    </div>
  )
}

export default ManagementPage;