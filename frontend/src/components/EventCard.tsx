import type { Lang } from '../types/Lang';
import type { TeamEvent } from '../types/TeamEvent';

import './EventCard.css';

type EventCardProps = {
  lang: Lang,
  teamEvent: TeamEvent
  teamName: string
}


function EventCard({ lang, teamEvent, teamName }: EventCardProps) {
  const {pointMethod, ownTotal, oppTotal} = teamEvent;

  return (
    <div className='history-panel__card'>
      <div className='history-panel__card-title'>
        {`${teamName}: ${ownTotal} - ${oppTotal}`}
      </div>

      <div className='history-panel__card-subtitle'>
        {pointMethod[lang]}
      </div>
    </div>
  )
};

export default EventCard;