import type { Lang } from '../../types/Lang';

import header from '../../assets/headers.json'
import './ModeSelector.css';


type ModeSelectorProps = {
  lang: Lang,
  isPlayerMode: boolean, 
  setIsPlayerMode: React.Dispatch<React.SetStateAction<boolean>>
}

function ModeSelector({ lang, isPlayerMode, setIsPlayerMode }: ModeSelectorProps) {
    const playerMode: string = header['mode_selector-player'][lang]
    const teamMode: string = header['mode_selector-team'][lang]

    return (
      <div className="mode-selector">
        <button 
          className={
            `mode-selector__button ${!isPlayerMode ? 'mode-selector__button--team' : 'mode-selector__button--player'}`
          }
          onClick={() => setIsPlayerMode((prev: boolean) => !prev)}
        >{isPlayerMode ? playerMode : teamMode}
        </button>
      </div>
    )
}

export default ModeSelector;