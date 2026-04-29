import { useState, useEffect, useRef } from 'react';
import type { Team } from '../types/Team.ts';

import './Selector.css'


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

  const[query, setQuery] = useState<string>(selectedTeam.teamName);
  const[isOpen, setIsOpen] = useState<boolean>(false);

  const filtered: Team[] = teams
    .sort((a, b) => {
      const q = query.toLowerCase()
      const aStarts = a.teamName.toLowerCase().startsWith(q)
      const bStarts = b.teamName.toLowerCase().startsWith(q)

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0
    })

  
  // For closing dropbox when clicking outside the dropbox
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    setQuery(selectedTeam.teamName)
  }, [selectedTeam])
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If the menu is open and the click is NOT inside the dropdownRef element
      if (isOpen && ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on cleanup
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]); // Re-run effect when isOpen changes

  return (
    <div className='selector' ref={ref}>
      <input className='selector__input'
        value={query}
        onChange={(event) => {setQuery(event.target.value); setIsOpen(true)}}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && <ul className='selector__dropdown'>
        {
          filtered.map((team: Team) => (
            <li
              className='selector__option'
              key={team.teamID} 
              value={team.teamName}
              onClick={() => {
                setSelectedTeam(team); 
                setQuery(team.teamName); 
                setIsOpen(false);
              }}
            >{team.teamName}</li>
          ))
        }
      </ul>}
    </div>
  )
}

export default TeamSelector;