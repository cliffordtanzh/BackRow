import { useState, useEffect } from 'react';
import { type NavigateFunction } from 'react-router-dom';
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

import { useEntity } from '../hooks/useEntity';

import { 
  type Membership, 
  DEFAULT_MEMBERSHIP,
  DEFAULT_MEMBER_PLAYER, 
  DEFAULT_MEMBER_MANAGER 
} from '../types/Membership';

import { type Role, DEFAULT_ROLE } from '../types/Role';
import { type Lang } from '../types/Lang';
import { type Team } from '../types/Team';
import { type Player } from '../types/Player';
import { type JwtPayload } from '../types/JwtPayload';
import { type Response } from '../types/Response';

import headers from '../assets/headers.json';

import '../App.css'
import './ManagementPage.css';


type ManagementPageProps = {
  navigate: NavigateFunction,
  lang: Lang,
  setLang: React.Dispatch<React.SetStateAction<Lang>>,
  isLoggedIn: boolean
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>,
}


function ManagementPage({
  navigate,
  lang,
  setLang,
  isLoggedIn,
  setIsLoggedIn,
}: ManagementPageProps) {

  const loggedInResponse: Response = {
    message: `Hello ${localStorage.getItem('playerName')}`,
    fade: false,
  }

  useEffect(() => {
    setIsLoggedIn((localStorage.getItem('Jwt_token') || null) !== null);
  }, [])

  // All states needed
  const[jwtToken, setJwtToken] = useState<string | null>(null);
  const[authorisation, setAuthorisation] = useState<Role>(DEFAULT_ROLE);

  const[selectedMembership, setSelectedMembership] = useState<Membership>(DEFAULT_MEMBERSHIP)
  const roles = [DEFAULT_MEMBER_PLAYER, DEFAULT_MEMBER_MANAGER]

  const [
    teams, 
    selectedTeam, 
    setSelectedTeam, 
    teamError, 
    fetchTeams
  ] = useEntity(lang, 'team');
  
  const [
    players, 
    selectedPlayer, 
    setSelectedPlayer, 
    playerError, 
    fetchPlayers
  ] = useEntity(lang, 'player');

  console.log(selectedTeam, selectedPlayer)

  const allErrors: Response[] = [playerError, teamError];
  const hasError = allErrors.some((resp) => (resp && resp.message))


  const chooseProps = (header: string) => {
    if (header === 'player') {
      return {
        items: players,
        selected: selectedPlayer,
        setSelected: setSelectedPlayer,
        getID: (item: Player) => `${header}_${item.ID}`,
        getName: (item: Player) => (item.name),
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
        getID: (item: Team) => `${header}_${item.ID}`,
        getName: (item: Team) => (item.name),
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
    setSelectedMembership((prev) => ({...prev, role: decoded['role']}))

    setSelectedPlayer((prev) => (
      players.find((player) => player.ID = decoded['playerID']) || prev
    ))
    setSelectedTeam((prev) => (
      teams.find((team) => team.ID = decoded['teamID']) || prev
    ))
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
    setAuthorisation(checkAuthorisation())
  }, [jwtToken])

  return (
    <div className='shell'>
      <div className='control-panel'>

        <div className='control-panel__controls'>
          <LanguageSelector lang={lang} setLang={setLang}/>
          <NavButton
            lang={lang}
            navigate={() => navigate('/entry')}
            buttonHeader={headers['entry_button']}
          />
          <NavButton
            lang={lang}
            navigate={() => navigate('/analysis')}
            buttonHeader={headers['analysis_button']}
          />
          <GeneralButton 
            label={headers['logout'][lang]} 
            onClick={logOut}
          />
        </div>

        <div className='shell-error'>
          {isLoggedIn && <SuccessMessage response={loggedInResponse}/>}
          {hasError ? allErrors.map((error: Response) => (
            error.message && <ErrorMessage response={error}/>
          )) : <GeneralButton
            label="Good Luck"
            onClick={() => (null)}
          />}
        </div>

        <div className='shell-title'>
          {headers['title'][lang]}
        </div>
        
      </div>


      <div className='manage'>
        <div className='manage-panel'>

          <div>
            <div className='manage-panel__title'>
              {headers['player_login'][lang]}
            </div>
            <LoginCard
              lang={lang}
              setJwtToken={setJwtToken}
            />
          </div>

          <div>
            <div className='manage-panel__title'>
              {headers['player_management'][lang]}
            </div>
            <PlayerRegistration
              lang={lang}
              onSuccess={fetchPlayers}
            />
          </div>
            
        </div>


        <div className='manage-panel'>

          <div className={['player', 'manager', 'root'].includes(authorisation) ? '' : 'blurred'}>
            <div className='manage-panel__title'>
              {headers['change_password'][lang]}
            </div>
              <PasswordChange lang={lang}/>
          </div>

          <div className={['manager', 'root'].includes(authorisation) ? '' : 'blurred'}>
            <div className='manage-panel__title'>
              {headers['team_management'][lang]}
            </div>
            <TeamEntry
              lang={lang}
              onSuccess={fetchTeams}
            />
          </div>

          <div className={['root'].includes(authorisation) ? '' : 'blurred'}>
            <div className='manage-panel__title'>
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