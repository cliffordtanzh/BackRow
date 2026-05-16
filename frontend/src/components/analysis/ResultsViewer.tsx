import ResultCard from '../analysis/ResultCard';
import { type Result } from "../../types/Result";

import './ResultsViewer.css'


type ResultsViewerProps = {
  results: Result[]
  isPlayerMode: boolean,
  setResults: React.Dispatch<React.SetStateAction<Result[]>>,
  selectedResult: Result,
  setSelectedResult: React.Dispatch<React.SetStateAction<Result | null>>,
}


function ResultsViewer({ 
  results,
  isPlayerMode,
  setResults,
  selectedResult,
  setSelectedResult,
}: ResultsViewerProps) {

  return (
    <div className='results-viewer'>
      <li className='result-list'>
        {results.map((result: Result) => (
          <ResultCard 
            result={result}
            isPlayerMode={isPlayerMode}
            setResults={setResults}
            selected={selectedResult.resultID === result.resultID}
            onClick={() => setSelectedResult(result)}
          />
        ))}
      </li>
    </div>
  )
}

export default ResultsViewer;