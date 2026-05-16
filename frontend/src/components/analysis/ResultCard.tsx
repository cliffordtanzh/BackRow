import axios from 'axios'

import { type Result } from '../../types/Result'
import './ResultCard.css'


type ResultCardProp = {
  result: Result,
  isPlayerMode: boolean,
  setResults: React.Dispatch<React.SetStateAction<Result[]>>,
  selected: boolean,
  onClick: () => void,
}


function ResultCard({ result, isPlayerMode, setResults, selected, onClick }: ResultCardProp) {
  const token = localStorage.getItem('jwtToken') || null

  const onDelete = () => {
    axios.post(
      `${import.meta.env.VITE_API_URL}/delete_result`,
      {resultID: result.resultID, isPlayerMode: isPlayerMode},
      {headers: {Authorisation: `Bearer ${token}`}}
    )
    .then((resp) => {
      setResults((prev) => prev.filter((res) => res.resultID !== result.resultID))
    })
    .catch((resp) => {
      console.log(resp)
    })
  }
  
  return (
    <div 
      className={selected ? 'result-card--selected' : 'result-card'}
      onClick={onClick}
    >
      <div className='result-card__content'>
        <div className='result-card__title'>{result.gameName}</div>
        <a 
          className='result-card__subtitle' 
          href={result.youtubeURL}
          target='_blank'
        >{result.youtubeURL}
        </a>

        <div className='result-card__meta'>
          {/* <span className='result-card__pill'>{}</span>
          <span className='result-card__pill'>{}</span> */}
        </div>
      </div>

      <div className='result-card__action'>
        <button
          className={selected ? 'result-card__delete--selected' : 'result-card__delete'}
          onClick={(e) => {
            e.stopPropagation();
            onDelete()
          }}
        >⌫</button>
      </div>
    </div>
  )
}

export default ResultCard;