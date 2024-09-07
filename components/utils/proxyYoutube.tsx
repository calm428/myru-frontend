import YouTubeEmbed from './YouTubeEmbedProps';

const App: React.FC = () => {
  const videoId = 'W2A2VAGKUpo'; // ID YouTube-видео

  return (
    <div>
      <h1>Видео через встраиваемый плеер</h1>
      <YouTubeEmbed videoId={videoId} />
    </div>
  );
};

export default App;
