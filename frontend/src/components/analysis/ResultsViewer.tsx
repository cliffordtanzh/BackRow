import { useState } from "react";

import Selector from "../general/Selector";

import { useEntity } from "../../hooks/useEntity";

import { type Lang } from "../../types/Lang";
import { type Player } from "../../types/Player";
import { type Team } from "../../types/Team";



type ResultsViewerProps = {
  lang: Lang
  isPlayerMode: boolean
}


function ResultsViewer({ lang, isPlayerMode }: ResultsViewerProps) {

  const [
    teams, 
    selectedTeam, 
    setSelectedTeam, 
  ] = useEntity(lang, 'team');
  
  const [
    players, 
    selectedPlayer, 
    setSelectedPlayer, 
  ] = useEntity(lang, 'player');

  const fetchData = () => {
    
  }

  return (
    <div className='selector-bar'>
      <Selector
        items={players}
        selected={selectedPlayer}
        setSelected={setSelectedPlayer}
        getID={(player) => player.ID}
        getName={(player) => player.name}
      />

      <Selector
        items={teams}
        selected={selectedTeam}
        setSelected={setSelectedTeam}
        getID={(team) => team.ID}
        getName={(team) => team.name}
      />
    </div>
  )
}

export default ResultsViewer;