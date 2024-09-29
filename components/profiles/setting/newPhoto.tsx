'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import '@/styles/editor.css';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { TfiWrite } from 'react-icons/tfi';
import 'react-quill/dist/quill.snow.css';
import * as z from 'zod';
import toast from 'react-hot-toast';
import AvatarUploader from '@/components/AvatarUploader';

export function NewPhoto({ openModal, setOpenModal, requestType }: any) {
  const t = useTranslations('main');

  const formSchema = z.object({
    title: z.string().min(1, t('title_is_required')),
    descr: z
      .string()
      .refine((value) => value.replace(/<[^>]*>?/gm, '').trim(), {
        message: t('content_is_required'),
      }),
  });

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      descr: '',
    },
  });

  const submitBlog = async (data: FormData) => {
    setOpenModal(false);
    const res = await axios.post(
      `/api/profiles/newReq?mode=${requestType === 'city' ? 'ReqCity' : 'ReqCat'}`,
      data
    );

    if (res.status === 200) {
      toast.success(t('request_save_success', { type: requestType }), {
        position: 'top-right',
      });
    } else {
      toast.error(t('request_save_success', { type: requestType }), {
        position: 'top-right',
      });
    }
  };

  const handleImageUpload = (newAvatarPath: string) => {
    // Логика после успешной загрузки аватара (например, обновление состояния профиля)
  };

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogContent className='w-full sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl'>
        <DialogHeader className='flex flex-row items-center gap-3'>
          <div className='rounded-full bg-primary/10 p-3 text-primary'>
            <TfiWrite className='size-5' />
          </div>
          <div>
            <DialogTitle>Фото вашего профиля</DialogTitle>
            <DialogDescription>Обновление вашей фотографии</DialogDescription>
          </div>
        </DialogHeader>
        <div>
          <AvatarUploader onImageUpload={handleImageUpload} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
