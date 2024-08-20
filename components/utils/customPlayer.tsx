import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

interface CustomPlayerProps {
  url: string;
}

const CustomPlayer: React.FC<CustomPlayerProps> = ({ url }) => {
  const playerRef = useRef<ReactPlayer>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [played, setPlayed] = useState(0);

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

  return (
    <div className="custom-player-wrapper">
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
      />
      <div className="custom-controls">
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
      </div>
    </div>
  );
};

export default CustomPlayer;