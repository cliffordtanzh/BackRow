import type { Lang } from '../types/Lang';
import type { TeamEvent } from '../types/TeamEvent';

import EventCard from './EventCard';

import './HistoryPanel.css'

type HistoryPanelProps = {
  lang: Lang,
  history: TeamEvent[],
}


function HistoryPanel({
  lang,
  history,
}: HistoryPanelProps) {
  
  return (
    <div className='history-panel'>
      {history.map((teamEvent: TeamEvent) => (
        <EventCard 
          lang={lang}
          teamEvent={teamEvent}
          key={`event_${teamEvent.eventID}`}
        />
      ))}
    </div>
  )
};

export default HistoryPanel;