import React, { useState, useRef } from 'react';
import { FaMicrophone, FaStop } from 'react-icons/fa';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.start();
        setIsRecording(true);

        mediaRecorder.ondataavailable = (event: BlobEvent) => {
          console.log('ondataavailable event triggered');
          if (event.data.size > 0) {
            console.log('Data size:', event.data.size);
            setAudioChunks((prev) => [...prev, event.data]);
          } else {
            console.log('Received empty data chunk');
          }
        };

        mediaRecorder.onstop = () => {
          console.log('Recording stopped');
          if (audioChunks.length > 0) {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            console.log('Final audio size:', audioBlob.size);
            onRecordingComplete(audioBlob);
            setAudioChunks([]);
          } else {
            console.error('Не удалось записать аудио.');
          }
        };
      })
      .catch((error) => {
        console.error('Ошибка доступа к микрофону:', error);
      });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div>
      {isRecording ? (
        <button onClick={stopRecording}>
          <FaStop size={24} color='red' />
        </button>
      ) : (
        <button onClick={startRecording}>
          <FaMicrophone size={24} color='green' />
        </button>
      )}
    </div>
  );
};

export default AudioRecorder;
