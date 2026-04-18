import TeamInputs from '../components/TeamInputs';
import type { BiLabel } from '../types/BiLabel'
import type { Lang } from '../types/Lang'

import './TeamStatsPage.css';

type TeamStatsPageProps = {
  lang: Lang,
  eventRecorder: (pointMethod: BiLabel) => void
}


function TeamStatsPage({lang, eventRecorder}: TeamStatsPageProps) {
  
  return (
    <div className='team-page'>
      <div className='team-page__main'>
        <div className='team-page__left'>
          <TeamInputs
            lang={lang}
            eventRecorder={eventRecorder}
          />
        </div>
      </div>

    </div>
  );
}

export default TeamStatsPage;