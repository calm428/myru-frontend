import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress } from 'react-icons/fa';

interface CustomPlayerProps {
  url: string;
}

const CustomPlayer: React.FC<CustomPlayerProps> = ({ url }) => {
  const playerRef = useRef<ReactPlayer>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [played, setPlayed] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const togglePlayPause = () => {
    setPlaying(!playing);
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(event.target.value));
  };

  const handleSeekChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPlayed = parseFloat(event.target.value);
    setPlayed(newPlayed);
    playerRef.current?.seekTo(newPlayed);
  };

  const handleProgress = (state: { played: number }) => {
    setPlayed(state.played);
  };

  const toggleFullscreen = () => {
    const element = playerContainerRef.current;

    if (!isFullscreen) {
      if (element?.requestFullscreen) {
        element.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="custom-player-wrapper w-full h-full md:w-[400px] md:h-[400px]" ref={playerContainerRef}>
      <ReactPlayer
        ref={playerRef}
        url={url}
        playing={playing}
        muted={muted}
        volume={volume}
        width="100%"
        height="100%"
        controls={false} // Отключаем встроенные элементы управления
        onProgress={handleProgress}
        playsinline
        config={{
          file: {
            attributes: {
              playsInline: true,
            },
          },
        }}
      />
      <div className="custom-controls flex !flex-row gap-4 !items-center">
        <button onClick={togglePlayPause} className="play-pause-btn">
          {playing ? <FaPause /> : <FaPlay />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={played}
          onChange={handleSeekChange}
          className="seek-slider"
        />
        <button onClick={toggleMute} className="mute-btn">
          {muted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
        />
        <button onClick={toggleFullscreen} className="fullscreen-btn">
          {isFullscreen ? <FaCompress /> : <FaExpand />}
        </button>
      </div>
    </div>
  );
};

export default CustomPlayer;
