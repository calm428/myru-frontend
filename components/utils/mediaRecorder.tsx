import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaStop, FaTrashAlt } from 'react-icons/fa';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = () => {
    if (isRecording) return;

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        streamRef.current = stream;
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

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

          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }

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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className='audio-recorder'>
      {isRecording ? (
        <div className='recording-controls'>
          <button onClick={stopRecording}>
            <FaStop size={24} color='red' />
          </button>
          <span className='recording-time'>{formatTime(recordingTime)}</span>
          <div className='recording-visualizer'>
            {/* Визуальный индикатор записи */}
            <span className='recording-dot'></span>
            <div className='recording-wave'></div>
          </div>
        </div>
      ) : (
        <button onClick={startRecording}>
          <FaMicrophone size={24} color='green' />
        </button>
      )}
    </div>
  );
};

export default AudioRecorder;
