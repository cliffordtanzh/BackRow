import { RadarChart, RadarAxis } from '@mui/x-charts/RadarChart';
import { blueberryTwilightPalette } from '@mui/x-charts';

import { type History } from '../../types/History';
import { type Lang } from '../../types/Lang';

import teamStats from '../../assets/team_stats.json';
import playerStats from '../../assets/player_stats.json';
import chartLabels from '../../assets/chart_labels.json';
import './Charts.css'


type StatsOverviewProps = {
  lang: Lang,
  history: History
}


function StatsOverview({ lang, history }: StatsOverviewProps) {
  const events = history.events
  if (events.length === 0) return null;

  const stats = history.isPlayerMode ? playerStats : teamStats
  const labels = chartLabels[history.isPlayerMode ? 'player_stats' : 'team_stats']

  const metrics = Object.keys(stats)
  const eventTypeLUT: Record<string, string> = {}
  for (const [metric, eventType] of Object.entries(stats)) {
    for (const name of eventType) {
      eventTypeLUT[name['en']] = metric
    }
  }
  
  const metricCounts = Object.fromEntries(metrics.map(key => [key, 0]))
  for (const event of events) {
    const metric = eventTypeLUT[event.eventType['en']];
    metricCounts[metric]++
  }

  return (
    <RadarChart
      className='chart'
      height={300}
      series={[{ label: 'Statistics', data: Object.values(metricCounts) }]}
      radar={{
        max: 8,
        metrics: metrics.map(name => labels[name as keyof typeof labels][lang]),
      }}
      colors={blueberryTwilightPalette}
    >
      <RadarAxis
        metric={labels[metrics[0] as keyof typeof labels][lang]}
        divisions={4}
        labelOrientation='horizontal'
        angle={45}
      />
  </RadarChart>
  )
}

export default StatsOverview;