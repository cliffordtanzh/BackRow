import type { Lang } from '../types/Lang';
import type { TeamEvent } from '../types/TeamEvent';

import './EventCard.css';

type EventCardProps = {
  lang: Lang,
  teamEvent: TeamEvent
}


function EventCard({lang, teamEvent}: EventCardProps) {
  const {selectedTeam, pointMethod, ownPointTotal, oppPointTotal} = teamEvent;
  const {teamName} = selectedTeam;

  return (
    <div className='history-panel__card'>
      <div className='history-panel__card-title'>
        {`${teamName}: ${ownPointTotal} - ${oppPointTotal}`}
      </div>

      <div className='history-panel__card-subtitle'>
        {pointMethod[lang]}
      </div>
    </div>
  )
};

export default EventCard;