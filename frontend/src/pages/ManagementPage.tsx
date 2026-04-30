import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import { usePlayers } from '../hooks/usePlayers';
import { useTeams } from '../hooks/useTeams';

import LanguageSelector from '../components/LanguageSelector';
import NavButton from '../components/NavButton';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import GeneralButton from '../components/GeneralButton';
import TeamManageInputs from '../components/TeamManageInputs';
import PlayerManageInputs from '../components/PlayerManageInputs';
import LoginCard from '../components/LoginCard';
import ManageMembership from '../components/ManageMembership';

import type { Lang } from '../types/Lang';
import type { Player } from '../types/Player';
import type { Team } from '../types/Team';
import type { Membership } from '../types/Membership';
import type { JwtPayload } from '../types/JwtPayload';

import headers from '../assets/headers.json';

import './ManagementPage.css';


function ManagementPage() {
  const[lang, setLang] = useState<Lang>('en');
  const navigate = useNavigate();

  const[jwtToken, setJwtToken] = useState<string | null>(null);
  const[isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const[authorisation, setAuthorisation] = useState<'player' | 'manager' | 'root'>('player');

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

  const[selectedMembership, setSelectedMembership] = useState<Membership>({
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
    if(header === 'player') {
      return {
        items: players,
        selected: selectedPlayer,
        setSelected: setSelectedPlayer,
        getID: (item: Player) => `${header}_${item.playerID}`,
        getName: (item: Player) => (item.playerName),
      }

    } else if(header === 'role') {
      return {
        items: roles,
        selected: selectedMembership,
        setSelected: setSelectedMembership,
        getID: (item: Membership) => `${header}_${item.role}`,
        getName: (item: Membership) => (item.role.charAt(0).toUpperCase() + item.role.slice(1)),
      }

    } else {
      return {
        items: teams,
        selected: selectedTeam,
        setSelected: setSelectedTeam,
        getID: (item: Team) => `${header}_${item.teamID}`,
        getName: (item: Team) => (item.teamName),
      }
    }
  }

  const checkAuthorisation = () => {
    const token = localStorage.getItem('JWT_token')
    if(token === null) {
      setIsLoggedIn(false);
      return 'player';
    }

    const decoded = jwtDecode<JwtPayload>(token)
    setIsLoggedIn(true);
    return decoded['role']
  }

  const logOut = () => {
    localStorage.removeItem('JWT_token');
    localStorage.removeItem('userName');
    setIsLoggedIn(false);
    setJwtToken(null);
    setAuthorisation('player');
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
    setAuthorisation(checkAuthorisation())
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
          <GeneralButton 
            label={headers['logout'][lang]} 
            onClick={logOut}
          />
        </div>

        <div className='manage-shell__error'>
          {isLoggedIn && <SuccessMessage 
            success={`Hello ${localStorage.getItem('userName')}`}
            fade={false}
          />}
          
          {hasError ? allErrors.map((error: string | null) => (
            error && <ErrorMessage key={error} error={error} fade={true}/>
          )) : <GeneralButton
            label="Good Luck"
            onClick={() => (null)}
          />}
        </div>
      </div>

      <div className='manage-shell__bot'>

        <div className='manage-shell__panel'>
          <div>
            <div className='manage-inputs__title'>
              {headers['login'][lang]}
            </div>
            <LoginCard
              lang={lang}
              setJwtToken={setJwtToken}
            />
          </div>

          <div className={['manager', 'root'].includes(authorisation) ? '' : 'blurred'}>
            <div className='manage-inputs__title'>
              {headers['team_management'][lang]}
            </div>
            <TeamManageInputs
              lang={lang}
              onSuccess={fetchTeams}
            />
          </div>
        </div>

        <div className={'manage-shell__panel'}>
          <div className='manage-inputs__title'>
            {headers['player_management'][lang]}
          </div>
          <PlayerManageInputs
            lang={lang}
            onSuccess={fetchPlayers}
          />

          <div className={['root'].includes(authorisation) ? '' : 'blurred'}>
            <div className='manage-inputs__title'>
              {headers['membership_management'][lang]}
            </div>
            <ManageMembership
              lang={lang}
              chooseProps={chooseProps}
            />
          </div>
        </div>

      </div>
    </div>
  )
}

export default ManagementPage;