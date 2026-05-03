import { useState, useEffect } from 'react';
import { ScatterChart } from '@mui/x-charts/ScatterChart';

import Event from '../../types/Event';
import { type History } from '../../types/History';
import { type Lang } from '../../types/Lang';

import './Charts.css'


type MatchOverviewProps = {
  lang: Lang,
  history: History
}


function MatchOverview({ lang, history }: MatchOverviewProps) {
  const events = history.events

  return (
    <ScatterChart
      className='MuiChartsChart-root'
      height={300}
      series={[
        {
            label: 'Points Won',
            data: events.map((event: Event, idx: number) => ({
              x: idx,
              y: event.pointDelta,
              id: event.eventID,
              label: event.eventType
            }))
        },
      ]}
      slotProps={{tooltip: {trigger: 'item'}}}
    />
  )
}

export default MatchOverview;