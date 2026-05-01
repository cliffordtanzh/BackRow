import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import LanguageSelector from '../components/general/LanguageSelector';
import NavButton from '../components/general/NavButton';
import ErrorMessage from '../components/general/ErrorMessage';
import SuccessMessage from '../components/general/SuccessMessage';
import GeneralButton from '../components/general/GeneralButton';

import PasswordChange from '../components/management/PasswordChange';
import LoginCard from '../components/management/LoginCard';
import TeamEntry from '../components/management/TeamEntry';
import PlayerRegistration from '../components/management/PlayerRegistration';
import ManageMembership from '../components/management/ManageMembership';

import { usePlayers } from '../hooks/usePlayers';
import { useTeams } from '../hooks/useTeams';

import { type Player, DEFAULT_PLAYER } from '../types/Player';
import { type Team, DEFAULT_TEAM } from '../types/Team';
import { type Role, DEFAULT_ROLE } from '../types/Role';
import { type Membership, DEFAULT_MEMBERSHIP } from '../types/Membership';

import { type Lang } from '../types/Lang';
import { type JwtPayload } from '../types/JwtPayload';
import { type Response } from '../types/Response';

import headers from '../assets/headers.json';
import './ManagementPage.css';


function ManagementPage() {
  const [lang, setLang] = useState<Lang>(() => 
    localStorage.getItem('lang') as Lang || 'en'
  );

  const navigate = useNavigate();

  const[jwtToken, setJwtToken] = useState<string | null>(null);
  const[isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  
  const[authorisation, setAuthorisation] = useState<Role>(DEFAULT_ROLE);
  const[selectedPlayer, setSelectedPlayer] = useState<Player>(DEFAULT_PLAYER)
  const[selectedTeam, setSelectedTeam] = useState<Team>(DEFAULT_TEAM)
  const[selectedMembership, setSelectedMembership] = useState<Membership>(DEFAULT_MEMBERSHIP)

  const {players, playerError, fetchPlayers} = usePlayers();
  const {teams, teamError, fetchTeams} = useTeams();
  
  const roles = [
    { playerID: 0, teamID: 0, role: 'none' },
    { playerID: 0, teamID: 0, role: 'player' },
    { playerID: 0, teamID: 0, role: 'manager' },
    { playerID: 0, teamID: 0, role: 'root' },
  ]

  const allErrors = [playerError, teamError];
  const hasError = allErrors.some((resp) => (resp && resp.message))

  const loggedInResponse: Response = {
    message: `Hello ${localStorage.getItem('playerName')}`,
    fade: false,
  }

  const chooseProps = (header: string) => {
    if (header === 'player') {
      return {
        items: players,
        selected: selectedPlayer,
        setSelected: setSelectedPlayer,
        getID: (item: Player) => `${header}_${item.playerID}`,
        getName: (item: Player) => (item.playerName),
      }

    } else if (header === 'role') {
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
    const token = localStorage.getItem('Jwt_token')
    if(token === null) {
      setIsLoggedIn(false);
      return 'none';
    }

    const decoded = jwtDecode<JwtPayload>(token)
    setIsLoggedIn(true);
    return decoded['role']
  }

  const logOut = () => {
    localStorage.removeItem('Jwt_token');
    localStorage.removeItem('playerID');
    localStorage.removeItem('playerName');
    localStorage.removeItem('teamID');
    localStorage.removeItem('teamName');

    setAuthorisation('none');
    setIsLoggedIn(false);
    setJwtToken(null);
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

  console.log(players)
  

  return (
    <div className='manage-shell'>
      <div className='manage-shell__top'>

        <div className='manage-shell__controls'>
          <LanguageSelector lang={lang} setLang={setLang}/>
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
          {isLoggedIn && <SuccessMessage response={loggedInResponse}/>}
          {hasError ? allErrors.map((error: Response) => (
            error.message && <ErrorMessage response={error}/>
          )) : <GeneralButton
            label="Good Luck"
            onClick={() => (null)}
          />}
        </div>
        
      </div>


      <div className='manage-shell__bot'>
        <div className='manage-shell__panel'>

          <div>
            <div className='manage-shell__panel-title'>
              {headers['player_login'][lang]}
            </div>
            <LoginCard
              lang={lang}
              setJwtToken={setJwtToken}
            />
          </div>

          <div>
            <div className='manage-shell__panel-title'>
              {headers['player_management'][lang]}
            </div>
            <PlayerRegistration
              lang={lang}
              onSuccess={fetchPlayers}
            />
          </div>
            
        </div>


        <div className='manage-shell__panel'>

          <div className={['player', 'manager', 'root'].includes(authorisation) ? '' : 'blurred'}>
            <div className='manage-shell__panel-title'>
              {headers['change_password'][lang]}
            </div>
              <PasswordChange lang={lang}/>
          </div>

          <div className={['manager', 'root'].includes(authorisation) ? '' : 'blurred'}>
            <div className='manage-shell__panel-title'>
              {headers['team_management'][lang]}
            </div>
            <TeamEntry
              lang={lang}
              onSuccess={fetchTeams}
            />
          </div>

          <div className={['root'].includes(authorisation) ? '' : 'blurred'}>
            <div className='manage-shell__panel-title'>
              {headers['membership_management'][lang]}
            </div>
            <ManageMembership
              lang={lang}
              chooseProps={chooseProps}
              setJwtToken={setJwtToken}
            />
          </div>

        </div>

      </div>
    </div>
  )
}

export default ManagementPage;