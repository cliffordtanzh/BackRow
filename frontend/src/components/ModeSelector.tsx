import './ModeSelector.css';


type ModeSelectorProps = {
  isPlayerMode: boolean, 
  setIsPlayerMode: React.Dispatch<React.SetStateAction<boolean>>
}

function ModeSelector({ isPlayerMode, setIsPlayerMode }: ModeSelectorProps) {
  
    return (
      <div className="mode-selector">
        <button 
          className={
            `mode-selector__button ${isPlayerMode ? 'mode-selector__button--player' : 'mode-selector__button--team'}`
          }
          onClick={() => setIsPlayerMode((prev: boolean) => !prev)}
        >{isPlayerMode ? 'Player Mode' : 'Team Mode'}
        </button>
      </div>
    )
}

export default ModeSelector;