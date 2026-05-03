import { List, ListItemButton, ListItemText } from '@mui/material';
import IconButton  from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

import { type Result } from '../../types/Result.ts';
import './ResultsViewer.css'


type ResultsViewerProps = {
  results: Result[]
  selectedResult: Result
  setSelectedResult: React.Dispatch<React.SetStateAction<Result>>
}


function ResultsViewer({ 
  results,
  selectedResult,
  setSelectedResult,
}: ResultsViewerProps) {

  return (
    <div className='results-viewer'>
      <List className='result-list'>
        {
          results.map((res: Result) => {
            return (
              <div key={res.resultID} className='result-card'>
                <ListItemButton
                  selected={res === selectedResult}
                  onClick={() => (setSelectedResult(res))}
                >

                  <ListItemText
                    className='result-title'
                    primary={res.gameName}
                    secondary={res.youtubeURL}
                  />

                  <IconButton
                    edge={'end'}
                    onClick={(event) => {
                      event.stopPropagation();
                      console.log("hi")
                    }}>
                    <DeleteIcon/>
                  </IconButton>

                </ListItemButton>
              </div>
            )
          })
        }
      </List>
    </div>
  )
}

export default ResultsViewer;