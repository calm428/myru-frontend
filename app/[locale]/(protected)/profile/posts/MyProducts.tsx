'use client';

import { useEffect, useState, useContext } from 'react';
import { Search } from 'lucide-react';
import { MdOutlinePostAdd } from 'react-icons/md';
import { RiArticleLine } from 'react-icons/ri';
import { MdOutlineSpeakerNotesOff } from 'react-icons/md';
import { ConfirmModal } from '@/components/common/confirm-modal';
import { NewPostModal } from '@/components/profiles/posts/new-post-modal';
import { PostCard, PostCardProps } from '@/components/profiles/posts/post-card';
import { PostCardSkeleton } from '@/components/profiles/posts/post-card-skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { PaginationComponent } from '@/components/common/pagination';
import { StreamingCreateModal } from '@/components/chat/streamingCreateModal';
import { CiStreamOn } from 'react-icons/ci';
import { PaxContext } from '@/context/context'; // Подключаем контекст
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const pageSize = 10;

export default function MyPostsPage() {
  const { user } = useContext(PaxContext); // Получаем данные пользователя
  const [maxPage, setMaxPage] = useState<number>(1);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showArchiveModal, setShowArchiveModal] = useState<boolean>(false);
  const [isArchiveLoading, setIsArchiveLoading] = useState<boolean>(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);
  const [deleteID, setDeleteID] = useState<number>(-1);
  const [archiveID, setArchiveID] = useState<number>(-1);
  const [blogs, setBlogs] = useState<PostCardProps[]>([]);
  const [fetchURL, setFetchURL] = useState<string>('/api/flows/me');
  const [isConversionModalOpen, setIsConversionModalOpen] = useState(false); // Модальное окно для конвертации

  const {
    data: fetchedData,
    error,
    mutate: blogsMutate,
  } = useSWR(fetchURL, fetcher);

  useEffect(() => {
    if (user?.seller) {
      setFetchURL('/api/flows/me'); // Устанавливаем URL для получения постов продавца
    }
  }, [user]);

  useEffect(() => {
    if (!error && fetchedData) {
      setBlogs(fetchedData.data);
      setMaxPage(Math.ceil(fetchedData.meta.total / pageSize));
    }
  }, [fetchedData, error]);

  const handleDelete = async () => {
    setIsDeleteLoading(true);

    try {
      const res = await fetch(`/api/flows/delete/${deleteID}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: deleteID }),
      });

      if (!res.ok) {
        throw new Error('Ошибка при удалении поста');
      }

      toast.success('Пост успешно удален!', {
        position: 'top-right',
      });

      blogsMutate();
    } catch (error) {
      toast.error('Ошибка при удалении поста', {
        position: 'top-right',
      });
    }

    setIsDeleteLoading(false);
    setShowDeleteModal(false);
  };

  const handleArchive = async () => {
    setIsArchiveLoading(true);

    try {
      const res = await fetch(`/api/flows/archive/${archiveID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: archiveID }),
      });

      if (!res.ok) {
        throw new Error('Ошибка при архивации поста');
      }

      toast.success('Пост успешно заархивирован!', {
        position: 'top-right',
      });

      blogsMutate();
    } catch (error) {
      toast.error('Ошибка при архивации поста', {
        position: 'top-right',
      });
    }

    setIsArchiveLoading(false);
    setShowArchiveModal(false);
  };

  const openConversionModal = () => {
    setIsConversionModalOpen(true);
  };

  const closeConversionModal = () => {
    setIsConversionModalOpen(false);
  };

  const handleConvertToSeller = async () => {
    try {
      const response = await fetch('/api/convert-to-seller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      });

      if (response.ok) {
        toast.success('Запрос на конвертацию отправлен!');
        closeConversionModal();
      } else {
        toast.error('Ошибка при отправке запроса');
      }
    } catch (error) {
      toast.error('Ошибка при отправке запроса');
    }
  };

  return (
    <div className='mb-[0px] max-w-full px-0 py-6 pb-0 md:mb-[0px]'>
      {user?.seller ? (
        <>
          {/* Отображение интерфейса для продавца */}
          <div className='px-0 py-4'>
            <StreamingCreateModal onCreate={() => {}} isLoading={false}>
              <Button className='btn btn--wide !m-0 flex w-full !rounded-md text-primary text-white'>
                <CiStreamOn className='mr-2 mt-0' size={20} />
                Начать стрим
              </Button>
            </StreamingCreateModal>
          </div>

          <div className='mb-4 flex w-full flex-col-reverse items-center justify-between gap-2 sm:flex-row'>
            <div className='relative w-full sm:w-80'>
              <Search className='absolute inset-y-0 left-3 my-auto size-4 text-gray-500' />
              <Input type='text' placeholder='Поиск' className='pl-12 pr-4' />
            </div>
            <div className='flex w-full items-center justify-between gap-1 sm:w-auto'>
              <div className='grid h-9 grid-cols-2 gap-2 rounded-lg bg-background p-1 px-2'>
                <Button className='h-7'>Все посты</Button>
                <Button className='h-7'>Архив</Button>
              </div>
              <NewPostModal mutate={blogsMutate}>
                <Button className='btn btn--wide !m-0 !rounded-md'>
                  <MdOutlinePostAdd className='mr-2 size-5' />
                  Новый пост
                </Button>
              </NewPostModal>
            </div>
          </div>

          <div>
            <ConfirmModal
              isOpen={showDeleteModal}
              onClose={() => setShowDeleteModal(false)}
              title='Вы уверены?'
              description='Вы уверены, что хотите удалить этот пост?'
              onConfirm={handleDelete}
              loading={isDeleteLoading}
            />
            <ConfirmModal
              isOpen={showArchiveModal}
              onClose={() => setShowArchiveModal(false)}
              title='Вы уверены?'
              description='Вы уверены, что хотите архивировать этот пост?'
              onConfirm={handleArchive}
              loading={isArchiveLoading}
            />
          </div>

          {!error ? (
            fetchedData && blogs ? (
              blogs?.length > 0 ? (
                <div className='w-full rounded-md p-0'>
                  {blogs.map((blog) => (
                    <PostCard key={blog.id} {...blog} />
                  ))}
                  {maxPage > 1 && (
                    <PaginationComponent
                      currentPage={1}
                      maxPage={maxPage}
                      gotoPage={(page) => {}}
                    />
                  )}
                </div>
              ) : (
                <div className='flex h-60 w-full items-center justify-center rounded-md bg-background/30 p-8'>
                  <div className='flex flex-col items-center text-gray-400'>
                    <MdOutlineSpeakerNotesOff className='size-20' />
                    Постов пока нет
                  </div>
                </div>
              )
            ) : (
              <PostCardSkeleton />
            )
          ) : (
            <div></div>
          )}
        </>
      ) : (
        <div className='text-center'>
          <h2 className='text-xl font-bold'>
            Ваш аккаунт не является продавцом.
          </h2>
          <Button onClick={openConversionModal} className='mt-4'>
            Конвертировать аккаунт в продавца
          </Button>

          {/* Модальное окно для конвертации */}
          <Dialog
            open={isConversionModalOpen}
            onOpenChange={closeConversionModal}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Конвертация аккаунта</DialogTitle>
                <DialogDescription>
                  Хотите конвертировать ваш аккаунт в аккаунт продавца? Это
                  позволит вам продавать товары и услуги на платформе.
                </DialogDescription>
              </DialogHeader>
              <div className='mt-4 flex justify-end'>
                <Button
                  onClick={handleConvertToSeller}
                  className='bg-blue-500 text-white'
                >
                  Подтвердить
                </Button>
                <Button onClick={closeConversionModal} variant='secondary'>
                  Отмена
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
