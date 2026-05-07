import ResultCard from '../analysis/ResultCard';
import type { Result } from "../../types/Result";

import './ResultsViewer.css'


type ResultsViewerProps = {
  results: Result[]
  selectedResult: Result,
  setSelectedResult: React.Dispatch<React.SetStateAction<Result | null>>,
}


function ResultsViewer({ 
  results,
  selectedResult,
  setSelectedResult,
}: ResultsViewerProps) {

  return (
    <div className='results-viewer'>
      <li className='result-list'>
        {results.map((result: Result) => (
          <ResultCard 
            result={result}
            selected={selectedResult.resultID === result.resultID}
            onClick={() => setSelectedResult(result)}
          />
        ))}
      </li>
    </div>
  )
}

export default ResultsViewer;