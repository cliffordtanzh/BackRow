import { useState } from 'react';


type TeamGeneralButtonProps = {
  buttonLabel: string,
  isVisible: boolean,
  setVisibility: React.Dispatch<React.SetStateAction<boolean>>
}


function TeamGeneralButton({
  buttonLabel,
  isVisible,
  setVisibility,
}: TeamGeneralButtonProps) {
  
  
  return (
    <div>
      {isVisible && <button 
        key={buttonLabel}
        onClick={() => setVisibility((prev: boolean) => !prev)}
      >{buttonLabel}</button>}
    </div>
  )
}

export default TeamGeneralButton;