import { List, ListItemButton, ListItemText } from '@mui/material';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';


import type { Lang } from "../../types/Lang";
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
    <List className='result-list'>
      {results.map((result: Result) => (
        <ListItemButton 
          className='result-card'
          key={result.resultID}
          selected={selectedResult.resultID === result.resultID}
          onClick={(event) => setSelectedResult(result)}
        >
          <ListItemText className='result-title'
            primary={result.gameName}
          />
          <IconButton edge='end' onClick={(event) => {
            event.stopPropagation();
          }}>
            <DeleteIcon></DeleteIcon>
          </IconButton>
        </ListItemButton>
      ))}
    </List>
  )
}

export default ResultsViewer;