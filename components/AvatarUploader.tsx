import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider'; // Ползунок для масштабирования
import getCroppedImg from '@/utils/cropImage'; // Вспомогательная функция для обрезки изображения
import { useTheme } from 'next-themes';
import axios from 'axios';
import toast from 'react-hot-toast';

interface AvatarUploaderProps {
  onImageUpload: (imagePath: string) => void;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ onImageUpload }) => {
  const { theme } = useTheme();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [imageType, setImageType] = useState<string>('image/jpeg'); // Тип изображения

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  // Конвертация Blob в File
  const blobToFile = (blob: Blob, fileName: string): File => {
    return new File([blob], fileName, {
      type: blob.type,
      lastModified: Date.now(),
    });
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
      setImageType(file.type); // Устанавливаем MIME-тип загружаемого файла
    }
  };

  const handleSave = async () => {
    if (!croppedAreaPixels || !imageSrc) return;

    try {
      setIsUploading(true);

      // Получаем обрезанное изображение с учетом MIME-типа
      const croppedImageBlob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        imageType
      );

      const croppedImageFile = blobToFile(
        croppedImageBlob,
        `avatar.${imageType.split('/')[1]}`
      );

      const formData = new FormData();
      formData.append('photo', croppedImageFile); // Название поля должно быть 'photo'

      // Отправляем на сервер
      const res = await axios.post('/api/upload/avatar', formData);

      if (res.status === 200) {
        toast.success('Аватар успешно обновлен');
        onImageUpload(res.data.filePath);
      } else {
        toast.error('Ошибка при обновлении аватара');
      }
    } catch (error) {
      toast.error('Ошибка при сохранении аватара');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <div className='avatar-uploader'>
      {imageSrc ? (
        <div className='crop-container'>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />

          <div className='relative flex  flex-col-reverse justify-end gap-2'>
            <Slider
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              min={1}
              max={3}
              step={0.1}
            />
            <div className='clex-row flex gap-4'>
              <Button variant='outline' onClick={handleCancel}>
                Отмена
              </Button>
              <Button onClick={handleSave} disabled={isUploading}>
                {isUploading ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className='file-input'>
          <input type='file' accept='image/*' onChange={handleFileChange} />
        </div>
      )}
    </div>
  );
};

// Вспомогательная функция для чтения файла
const readFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
};

export default AvatarUploader;
