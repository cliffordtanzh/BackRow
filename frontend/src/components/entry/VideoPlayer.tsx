import ReactPlayer from 'react-player'

import FieldInput from '../../components/general/FieldInput.tsx';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Lang } from '../../types/Lang';

import headers from '../../assets/headers.json';

import '../../pages/EntryPage.css';


type VideoPlayerProps = {
  lang: Lang,
  videoURL: string,
  gameName: string,
  setVideoURL: React.Dispatch<React.SetStateAction<string>>,
  setGameName: React.Dispatch<React.SetStateAction<string>>,
}


function VideoPlayer({
  lang,
  videoURL,
  gameName,
  setVideoURL,
  setGameName,
}: VideoPlayerProps) {

  const playerRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState<boolean>(false);

  const togglePlay = useCallback(() => { setPlaying(prev => !prev); }, []);

  useEffect(() => {
    const seekBy = (seconds: number): void => {
      const player = playerRef.current;
      if (!player) return;
      player.currentTime = Math.max(0, Math.min(player.currentTime + seconds, player.duration || 0));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.target instanceof HTMLElement)) {
        return;
      }

      const tag = e.target.tagName
      if ((tag === 'INPUT') || (tag === 'TEXTAREA') || e.target.isContentEditable) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;

        case 'ArrowRight':
          seekBy(5);
          break;

        case 'ArrowLeft':
          seekBy(-5);
          break;

        default:
          break
      }

    }

    window.addEventListener('keydown', handleKeyDown);
    return () => (window.removeEventListener('keydown', handleKeyDown))
  }, [togglePlay])

  return (
      <div className='entry-video'>
        <div className='entry-header'>
          {headers['video'][lang]}
        </div>

        <div className='entry-video__inputs'>
          <FieldInput
            setField={setVideoURL}
            value={videoURL}
            placeholder={'YouTube URL'}
          />
          
          <FieldInput
            setField={setGameName}
            value={gameName}
            placeholder={'Game Name'}
          />
        </div>

        <div className='entry-video__frame'>
          {videoURL && <ReactPlayer
            ref={playerRef}
            src={videoURL}
            playing={playing}
            controls={true}
          />}
        </div>
      </div>
  )
}

export default VideoPlayer;