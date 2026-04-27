import type { Lang } from '../types/Lang';
import type { NavigateFunction } from 'react-router-dom';
import type { BiLabel } from '../types/BiLabel';

import './NavButton.css';


type NavButtonProps = {
  lang: Lang
  navigate: NavigateFunction
  buttonHeader: BiLabel
}


function NavButton({ lang, navigate, buttonHeader }: NavButtonProps) {
  return (
    <div className='management-button'>
      <button 
        className='management-button__button'
        onClick={() => navigate('/manage')}
      >
        {buttonHeader[lang]}
      </button>
    </div>
  )
}

export default NavButton;