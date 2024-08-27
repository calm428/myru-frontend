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
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = () => {
    if (isRecording) return; // Не допускаем запуск записи, если она уже идет

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        streamRef.current = stream;
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        // Очищаем аудио фрагменты перед началом новой записи
        audioChunksRef.current = [];

        mediaRecorder.start();
        setIsRecording(true);

        mediaRecorder.ondataavailable = (event: BlobEvent) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          setIsRecording(false);

          if (audioChunksRef.current.length > 0) {
            const audioBlob = new Blob(audioChunksRef.current, {
              type: 'audio/wav',
            });
            onRecordingComplete(audioBlob);
          } else {
            console.error('Не удалось записать аудио.');
          }

          // Отключаем микрофон
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }

          // Очищаем фрагменты после завершения записи
          audioChunksRef.current = [];
        };
      })
      .catch((error) => {
        console.error('Ошибка доступа к микрофону:', error);
      });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
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
