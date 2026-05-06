import { useEffect, useState } from 'react';
import { RadarChart, RadarAxis } from '@mui/x-charts/RadarChart';
import { blueberryTwilightPalette } from '@mui/x-charts';

import { type LoadedEvents } from '../../types/LoadedEvents';
import { type Lang } from '../../types/Lang';

import teamStats from '../../assets/team_stats.json';
import playerStats from '../../assets/player_stats.json';
import chartLabels from '../../assets/chart_labels.json';
import './Charts.css'
import { Box } from '@mui/system';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';


type StatsOverviewProps = {
  lang: Lang,
  loadedEvents: LoadedEvents
}


function StatsOverview({ lang, loadedEvents }: StatsOverviewProps) {
  const events = loadedEvents.events
  const labels = chartLabels[loadedEvents.isPlayerMode ? 'player_stats' : 'team_stats']

  const entityStats = loadedEvents.isPlayerMode ? playerStats : teamStats
  const LUT: Record<string, string> = {}
  for (const [key, value] of Object.entries(entityStats)) {
    for (const val of value) {
      LUT[val['en']] = key
    }
  }
  
  const overviewKeys = Object.keys(entityStats)
  if (overviewKeys.length === 0) {
    return null
  }

  const overviewChartKey = `${loadedEvents.isPlayerMode}-${lang}-overview`
  const overviewCounts = Object.fromEntries(overviewKeys.map((key) => [key, 0]))
  const overviewMetrics = overviewKeys.map((key) => labels[key as keyof typeof labels][lang])
  const defaultOverviewMetric = overviewMetrics[0]
  
  for (const event of events) {
    const key = LUT[event.eventType['en']]
    if (key !== undefined) {
      overviewCounts[key]++
    }
  }

  const [selectedMetric, setSelectedMetric] = useState<string>(overviewKeys[0])

  const activeMetric = overviewKeys.includes(selectedMetric)
    ? selectedMetric
    : overviewKeys[0]

  useEffect(() => {
    if (selectedMetric !== activeMetric) {
      setSelectedMetric(activeMetric)
    }
  }, [activeMetric, selectedMetric])

  const inDepthKeys = entityStats[activeMetric as keyof typeof entityStats]
  const inDepthMetrics = inDepthKeys.map((key) => key[lang])
  const defaultInDepthMetric = inDepthMetrics[0]
  const inDepthChartKey = `${loadedEvents.isPlayerMode}-${lang}-${activeMetric}-detail`
  const inDepthCounts = Object.fromEntries(inDepthKeys.map((key) => [key['en'], 0]))
  for (const event of events) {
    const key = event.eventType['en']
    if (key in inDepthCounts) {
      inDepthCounts[key]++
    }
  }

  
  return (
    <Box className='stats-overview'>
      <RadarChart
        key={overviewChartKey}
        className='metrics'
        height={300}
        series={[{ 'data': Object.values(overviewCounts) }]}
        radar={{
          max: 8,
          metrics: overviewMetrics,
        }}
        colors={blueberryTwilightPalette}
      >
        <RadarAxis
          metric={defaultOverviewMetric}
          divisions={4}
          labelOrientation='horizontal'
          angle={45}
        />
      </RadarChart>

            
      <Box className='stats'>
        <ToggleButtonGroup 
          className='metric-selector'
          value={activeMetric}
          onChange={(_, value: string | null) => {
            if (value !== null) {
              setSelectedMetric(value)
            }
          }}
          exclusive
          fullWidth
        >
          {
            overviewKeys.map((key) => (
              <ToggleButton
                key={key}
                value={key}
                sx={{color: 'white', textTransform: 'none'}}
              >
                {labels[key as keyof typeof labels][lang]}
              </ToggleButton>

            ))
          }

        </ToggleButtonGroup>
        
        <RadarChart
            key={inDepthChartKey}
            height={300}
            series={[{ 'data': Object.values(inDepthCounts) }]}
            radar={{
              max: 8,
              metrics: inDepthMetrics,
            }}
            colors={blueberryTwilightPalette}
          >
            <RadarAxis
              metric={defaultInDepthMetric}
              divisions={4}
              labelOrientation='horizontal'
              angle={45}
            />
        </RadarChart>
      </Box>
  </Box>
  )
}

export default StatsOverview;