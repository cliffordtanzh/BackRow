import Event from '../../types/Event';
import { type Lang } from '../../types/Lang';

import './EventCard.css';


type EventCardProps = {
  lang: Lang
  event: Event
  entityName: string
  pointsWon: number
  pointsLost: number
}


function EventCard({ 
  lang, 
  event,
  entityName,
  pointsWon, 
  pointsLost,
}: EventCardProps) {

  const { eventType } = event
  
  return (
    <div className='event_card'>
      <div className='event_card-title'>
        {`${entityName}: ${pointsWon} - ${pointsLost}`}
      </div>

      <div className='event_card-subtitle'>
        {eventType[lang]}
      </div>
    </div>
  )
};

export default EventCard;