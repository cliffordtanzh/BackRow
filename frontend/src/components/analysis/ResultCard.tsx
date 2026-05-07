import type { Result } from '../../types/Result'
import './ResultCard.css'


type ResultCardProp = {
  result: Result
  selected: boolean
  onClick: () => void
}


function ResultCard({ result, selected, onClick }: ResultCardProp) {
  return (
    <div 
      className={selected ? 'result-card--selected' : 'result-card'}
      onClick={onClick}
    >
      <div className="result-card__content">
        <div className="result-card__title">{result.gameName}</div>
        <a 
          className="result-card__subtitle" 
          href={result.youtubeURL}
          target='_blank'
        >{result.youtubeURL}
        </a>

        <div className="result-card__meta">
          {/* <span className="result-card__pill"></span>
          <span className="result-card__pill"></span> */}
        </div>
        
      </div>

      <div className="result-card__action">
      </div>
    </div>
  )
}

export default ResultCard;