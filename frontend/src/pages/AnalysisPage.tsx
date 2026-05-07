import axios from 'axios';
import { useState, useEffect } from 'react';
import { type NavigateFunction } from 'react-router-dom';

import { useEntity } from '../hooks/useEntity';

import useResults from '../hooks/useResults';
import useAuthentication from '../hooks/useAuthentication';
import { useResponse } from '../hooks/useResponse';

import ResultsViewer from '../components/analysis/ResultsViewer';
import StatsOverview from '../components/analysis/StatsOverview';

import Selector from '../components/general/Selector';
import LanguageSelector from '../components/general/LanguageSelector';
import NavButton from '../components/general/NavButton';
import ModeSelector from '../components/general/ModeSelector';
import SuccessMessage from '../components/general/SuccessMessage';
import ErrorMessage from '../components/general/ErrorMessage';
import GeneralButton from '../components/general/GeneralButton';
import HistoryPanel from '../components/general/HistoryPanel';

import { type Team } from '../types/Team';
import { type TeamMember } from '../types/TeamMember';
import { type Lang } from '../types/Lang';
import { type Response } from '../types/Response';
import { type Result } from '../types/Result';
import { type LoadedEvents, DEFAULT_LOADED_EVENT } from '../types/LoadedEvents';
import { type EventQuery } from '../types/EventQuery';

import headers from '../assets/headers.json';
import responses from '../assets/responses.json';
import '../App.css'
import './AnalysisPage.css'
import { useTeamMembers } from '../hooks/useTeamMembers';


type AnalysisPageProps = {
  navigate: NavigateFunction,
  lang: Lang,
  setLang: React.Dispatch<React.SetStateAction<Lang>>,
  isLoggedIn: boolean
}


function AnalysisPage({
  navigate,
  lang,
  setLang,
  isLoggedIn,
}: AnalysisPageProps) {

  const loggedInResponse: Response = {
    message: isLoggedIn ? `Hello ${localStorage.getItem('playerName')}`: 'Log in to view results',
    fade: false,
  }

  const [, , authorisation] = useAuthentication();
  const [isPlayerMode, setIsPlayerMode] = useState<boolean>(true);

  const [teams, selectedTeam, setSelectedTeam] = useEntity(lang, 'team');
  const [teamMembers, memberSuccess, memberError] = useTeamMembers(lang, selectedTeam);
  const [selectedPlayer, setSelectedPlayer] = useState<TeamMember>({
    teamID: Number(localStorage.getItem('teamID') || 0),
    teamName: localStorage.getItem('teamName') || '',
    playerID: Number(localStorage.getItem('playerID') || 0),
    playerName: localStorage.getItem('playerName') || '',
    role: authorisation,
  });

  const storedPlayerID = Number(localStorage.getItem('playerID') || 0);
  const storedTeamID = Number(localStorage.getItem('teamID') || 0);

  const queryPlayerID = (
    authorisation === 'player' ? storedPlayerID : selectedPlayer.playerID
  );

  const queryTeamID = (
    authorisation === 'root' ? selectedTeam.ID : storedTeamID
  );

  const [results] = useResults(
    lang, 
    queryTeamID,
    queryPlayerID,
    isPlayerMode
  )

  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [loadedEvents, setLoadedEvents] = useState<LoadedEvents>(DEFAULT_LOADED_EVENT)
  const [fetchSuccess, setFetchSuccess, fetchError, setFetchError] = useResponse();

  const allErrors: Response[] = [memberError, fetchError]
  const allSuccess: Response[] = [memberSuccess, fetchSuccess]

  const hasError: boolean = allErrors.some((resp) => (resp && resp.message))
  const hasSuccess: boolean = allSuccess.some((resp) => (resp && resp.message))

  useEffect(() => {
    setSelectedResult(null);
    setLoadedEvents(DEFAULT_LOADED_EVENT);
  }, [queryPlayerID, queryTeamID, isPlayerMode])

  useEffect(() => {
    if (results.length === 0) {
      setSelectedResult(null);
      setLoadedEvents(DEFAULT_LOADED_EVENT);
      return;
    }

    if (selectedResult === null) {
      setSelectedResult(results[0]);
      return;
    }

    const matchingResult = results.find((result: Result) => (
      result.resultID === selectedResult.resultID
    ))

    if (!matchingResult) {
      setSelectedResult(results[0]);
      return;
    }

    if (matchingResult !== selectedResult) {
      setSelectedResult(matchingResult);
    }
  }, [results, selectedResult])

  useEffect(() => {
    let isCurrent = true;

    if (selectedResult) {
      const payload: EventQuery = {
        ID: selectedResult.resultID,
        isPlayerMode: isPlayerMode
      }

      axios.post(
        '/fetch_events',
        payload,
        {headers: {Authorisation: `Bearer ${localStorage.getItem('jwtToken')}`}}
      )
      .then((resp) => {
        if (!isCurrent) {
          return;
        }

        setLoadedEvents({
          resultID: selectedResult.resultID,
          isPlayerMode: isPlayerMode,
          events: resp.data.data,
        });
        setFetchSuccess((prev) => ({
          ...prev, 
          message: responses[resp.data.detail as keyof typeof responses][lang]
        }))
      })
      .catch((resp) => {
        if (!isCurrent) {
          return;
        }
        
        if (resp.response.data.detail) {
          const responseKey = resp.response.data.detail
          if (responseKey instanceof String) {
            setFetchError((prev) => ({
              ...prev, 
              message: responses[responseKey as keyof typeof responses][lang]
            }))
          } else {
            setFetchError((prev) => ({
              ...prev, 
              message: responseKey.msg
            }))
          }
        }
        else {
          setFetchError((prev) => ({
            ...prev,
            message: 'Something went wrong'
          }))
        }
      })
    }

    return () => {
      isCurrent = false;
    }
  }, [selectedResult, isPlayerMode])

  useEffect(() => {
    if (teamMembers.length > 0) {
      setSelectedPlayer(teamMembers[0])
    }
  }, [teamMembers])

  // !!
  const canRenderCharts = (
    selectedResult !== null &&
    loadedEvents.resultID === selectedResult.resultID &&
    loadedEvents.isPlayerMode === isPlayerMode
  )

  return (
    <div className='shell'>
      <div className='control-panel'>
        <div className='control-panel__controls'>
          <LanguageSelector lang={lang} setLang={setLang}/>
          <NavButton
            lang={lang}
            navigate={() => navigate('/')}
            buttonHeader={headers['manage_button']}
            />
          <NavButton
            lang={lang}
            navigate={() => navigate('/entry')}
            buttonHeader={headers['entry_button']}
            />
          <ModeSelector
            lang={lang}
            isPlayerMode={isPlayerMode}
            setIsPlayerMode={setIsPlayerMode}
          />
        </div>

        <div className='shell-error'>
          {isLoggedIn ? 
            <SuccessMessage response={loggedInResponse}/> : 
            <ErrorMessage response={loggedInResponse}/>
          }
          {hasSuccess && allSuccess.map((success: Response) => (
            success.message && <SuccessMessage key={success.message} response={success}/>
          ))}
          {hasError && allErrors.map((error: Response) => (
            error.message && <ErrorMessage key={error.message} response={error}/>
          ))}
          {!hasError && !hasSuccess && <GeneralButton
            label='Good Luck'
            onClick={() => (null)}
            />}
        </div>

        <div className='shell-title'>
          {headers['title'][lang]}
        </div>
      </div>
      
      <div className='analysis'>
        <div className='analysis-panel'>
          <div className='selector-bar'>
            <div>
              {['manager', 'root'].includes(authorisation) && <div>
                <div className='selector-label'>Player Name</div>
                <Selector
                  items={teamMembers}
                  selected={selectedPlayer}
                  setSelected={setSelectedPlayer}
                  getID={(player: TeamMember) => (player.playerID)}
                  getName={(player: TeamMember) => (player.playerName)}
                />
              </div>}
            </div>

            <div>
              {['root'].includes(authorisation) && <div>
                <div className='selector-label'>Team Name</div>
                <Selector
                  items={teams}
                  selected={selectedTeam}
                  setSelected={setSelectedTeam}
                  getID={(team: Team) => (team.ID)}
                  getName={(team: Team) => (team.name)}
                />
              </div>}
            </div>
          </div>

          {isLoggedIn && selectedResult && <ResultsViewer 
            results={results}
            selectedResult={selectedResult}
            setSelectedResult={setSelectedResult}
          ></ResultsViewer>}
        </div>


        <div className='analysis-panel'>
          {canRenderCharts && <StatsOverview
            lang={lang}
            loadedEvents={loadedEvents}
          />}
        </div>

        {canRenderCharts && <HistoryPanel
          lang={lang}
          events={loadedEvents.events}
          isPlayerMode={isPlayerMode}
          teamName={selectedTeam.name}
          playerName={selectedPlayer.playerName}
          analysisMode={true}
        />}
      </div>


    </div>
  )
}

export default AnalysisPage;