import type { Lang } from '../types/Lang';

import headers from '../assets/headers.json';
import './HistoryButton.css'


type historyButtonProps = {
  lang: Lang,
  onClick: () => void;
  type: 'undo' | 'clear',
}

function HistoryButton({
  lang,
  onClick,
  type,
}: historyButtonProps) {

  return (
    <button 
      className='history-button'
      onClick={onClick}
    >
      {headers[type][lang]}
    </button>
  )
}

export default HistoryButton;

