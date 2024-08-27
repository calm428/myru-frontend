'use client';
import { useState, useContext, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Textarea } from '@/components/ui/textarea';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { PaxContext } from '@/context/context';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import toast from 'react-hot-toast';
import { FaSpinner, FaSearch } from 'react-icons/fa';
import ReactAudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import useSWR, { mutate } from 'swr';
import Link from 'next/link';
import CustomPlayer from '@/components/utils/customPlayer';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import Image from 'next/image';
import LongText from './longText';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { timeAgo } from '@/helpers/utils';
import NestedCommentSection from './NestedCommentSection';
import { FaReply, FaTimes, FaPaperclip, FaArrowRight } from 'react-icons/fa';
import AudioRecorder from '@/components/utils/mediaRecorder';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FaEllipsisV } from 'react-icons/fa';

type FilePost = {
  id: string;
  url: string;
  filename: string;
};

type Comment = {
  id: string;
  content: string;
  user: {
    Name: string;
    Photo: string;
  };
  created_at: string;
};

type User = {
  ID: string;
  Seller: boolean;
  Trial: boolean;
  Name: string;
  Email: string;
  Password: string;
  Role: string;
  Provider: string;
  Photo: string;
  Verified: boolean;
  Banned: boolean;
  Plan: string;
  Signed: boolean;
  ExpiredPlanAt: string | null;
  Tcid: number;
  DeviceIOS: string;
  DeviceIOSVOIP: string;
  TotalFollowers: number;
  VerificationCode: string;
  PasswordResetToken: string;
  TelegramActivated: boolean;
  TelegramToken: string;
  TelegramName: string | null;
  PasswordResetAt: string;
  Billing: any | null;
  Profile: any | null;
  filled: boolean;
  Session: string;
  Storage: string;
  Tid: number;
  Blogs: any | null;
  CreatedAt: string;
  UpdatedAt: string;
  OnlineHours: any[];
  TotalOnlineHours: any[];
  TotalOnlineStreamingHours: any[];
  OfflineHours: number;
  TotalRestBlogs: number;
  TotalBlogs: number;
  Rating: number;
  LimitStorage: number;
  last_online: string;
  online: boolean;
  domains: any | null;
  Followings: any[] | null;
  Followers: any[] | null;
  IsBot: boolean;
};

type Post = {
  id: string;
  username: string;
  avatar: string;
  content: string;
  created_at: string;
  likes: any[];
  likeCount: number; // Новое поле для количества лайков
  comments: any[];
  commentCount: number; // Новое поле для количества комментариев
  shares: any[];
  files: FilePost[];
  isEditing?: boolean;
  isSaving?: boolean;
  user: User; // Добавляем свойство user
};

const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={`animate-pulse rounded bg-gray-300 dark:bg-gray-700 ${className}`}
    ></div>
  );
};

export default function DashboardPage() {
  const { user: userData, socket } = useContext(PaxContext);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [skip, setSkip] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [isCommentLoading, setIsCommentLoading] = useState<boolean>(false);
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const router = useRouter(); // useRouter from 'next/navigation'
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSkip(0);
    fetchPosts(true, searchTerm);
  };

  useEffect(() => {
    if (selectedPost) {
      const params = new URLSearchParams(searchParams);
      params.set('comments', 'open');
      params.set('postId', selectedPost.id);

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [selectedPost]);

  const handleCommentClick = (post: Post) => {
    sessionStorage.setItem('scrollPosition', window.scrollY.toString());

    // Обновляем состояние компонента сразу
    const params = new URLSearchParams(searchParams);
    params.set('comments', 'open');
    params.set('postId', post.id);
    // Обновляем URL
    const newUrl = `${pathname}?${params.toString()}`;

    router.replace(newUrl, { scroll: false });
  };

  useEffect(() => {
    // Логика загрузки комментариев, если параметр присутствует
    if (searchParams.get('comments') === 'open') {
      // Ваша логика для загрузки комментариев
      console.log('Загрузка комментариев...');
    }
  }, [searchParams]);

  useEffect(() => {
    // Проверяем, есть ли в URL параметр `postId`, и если есть, открываем соответствующий пост
    const postIdFromParams = searchParams.get('postId');
    if (postIdFromParams) {
      const post = posts.find((p) => p.id === postIdFromParams);
      if (post) {
        setSelectedPost(post);
      } else {
      }
    }
  }, [searchParams, posts]);

  const handleBackToPosts = () => {
    setSelectedPost(null);

    const savedScrollPosition = sessionStorage.getItem('scrollPosition');
    if (savedScrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition, 10));
        sessionStorage.removeItem('scrollPosition');
      }, 0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const handleToggleLike = async (postId: string) => {
    setIsLiking(true);
    try {
      const res = await fetch(`/api/post/${postId}/likes`, {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Failed to toggle like');
      }

      const updatedPost = await res.json();

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, likes: updatedPost.likes } : post
        )
      );

      // toast.success('Лайк обновлен', { position: 'top-right' });
    } catch (error) {
      toast.error('Ошибка при обновлении лайка', { position: 'top-right' });
    } finally {
      setIsLiking(false);
    }
  };

  const renderFile = (file: any, index: number) => {
    const { url, filename } = file;
    const sanitizedUrl = url.replace('../server-data/img-store/', '');
    const fileUrlImage = `https://proxy.myru.online/256/https://img.myru.online/${sanitizedUrl}`;
    const fileUrlIAudio = `https://img.myru.online/${sanitizedUrl}`;
    const fileUrl = `https://img.myru.online/${sanitizedUrl}`;

    if (
      url.endsWith('.jpeg') ||
      url.endsWith('.jpg') ||
      url.endsWith('.png') ||
      url.endsWith('.gif')
    ) {
      return (
        <CarouselItem key={index}>
          <div className='relative h-72 w-full'>
            <Image
              src={fileUrlImage}
              alt={filename}
              layout='fill'
              objectFit='cover'
            />
          </div>
        </CarouselItem>
      );
    } else if (
      url.endsWith('.mp4') ||
      url.endsWith('.mkv') ||
      url.endsWith('.mov')
    ) {
      return (
        <div key={index} className='relative mb-4 h-72 w-full'>
          <CustomPlayer url={fileUrl} />
        </div>
      );
    } else if (url.endsWith('.pdf')) {
      return (
        <div key={index} className='mb-4'>
          <a
            href={fileUrl}
            download
            className='mt-2 block text-blue-500 hover:underline'
          >
            Скачать файл {filename}
          </a>
        </div>
      );
    } else if (
      url.endsWith('.doc') ||
      url.endsWith('.docx') ||
      url.endsWith('.xls') ||
      url.endsWith('.xlsx')
    ) {
      return (
        <div key={index}>
          <a href={fileUrl} download className='text-blue-500 hover:underline'>
            Скачать файл {filename}
          </a>
        </div>
      );
    } else if (url.endsWith('.mp3') || url.endsWith('.wav')) {
      return (
        <div key={index}>
          <ReactAudioPlayer
            src={fileUrlIAudio}
            className='mb-4 h-auto max-w-[400px]'
          />
        </div>
      );
    } else {
      return (
        <div key={index}>
          <a href={fileUrl} download className='text-blue-500 hover:underline'>
            {filename}
          </a>
        </div>
      );
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      setIsCommentLoading(true);
      const res = await fetch(`/api/post/${postId}/comments`);
      if (!res.ok) {
        throw new Error('Failed to fetch comments');
      }
      const result = await res.json();
      setComments(result.data); // Установка массива комментариев из `data`
    } catch (error) {
      console.error('Ошибка при получении комментариев:', error);
    } finally {
      setIsCommentLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) {
      alert('Пожалуйста, добавьте текст или файл.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('content', content);

      const hashtags = content.match(/#[\wа-яА-ЯёЁ]+/g) || [];
      formData.append('tags', hashtags.join(',')); // Отправка хэштегов на сервер

      files.forEach((file) => {
        formData.append('files', file);
      });

      const res = await fetch('/api/post/add', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to create post');
      }

      const newPost = await res.json();

      if (socket) {
        socket.send(
          JSON.stringify({
            command: 'newPost',
            post: newPost,
          })
        );
      }

      setContent('');
      setFiles([]);
    } catch (error) {
      alert('Ошибка при создании поста');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, isEditing: true }
          : { ...post, isEditing: false }
      )
    );
  };

  const handleSaveEdit = async (postId: string, editedContent: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, isSaving: true } : post
      )
    );

    try {
      const res = await fetch(`/api/post/update/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editedContent }),
      });

      if (!res.ok) {
        throw new Error('Failed to update post');
      }

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                content: editedContent,
                isEditing: false,
                isSaving: false,
              }
            : post
        )
      );
      // toast.success('Пост обновлен', { position: 'top-right' });
    } catch (error) {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, isSaving: false } : post
        )
      );
      toast.error('Ошибка при обновлении поста', { position: 'top-right' });
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const res = await fetch(`/api/post/delete/${postId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete post');
      }

      if (socket) {
        socket.send(
          JSON.stringify({
            command: 'deletePost',
            postId: postId,
          })
        );
      }

      // setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      toast.success('Пост удален', { position: 'top-right' });
    } catch (error) {
      toast.error('Ошибка при удалении поста', { position: 'top-right' });
    }
  };

  const fetchPosts = async (isNewRequest = false, tag = '') => {
    try {
      const res = await fetch(
        `/api/post/getfeed?skip=${isNewRequest ? 0 : skip}&limit=10${tag ? `&tag=${encodeURIComponent(tag)}` : ''}`
      );
      if (!res.ok) {
        throw new Error('Failed to fetch posts');
      }
      const result = await res.json();

      const postsData = result.data.map((post: Post) => ({
        ...post,
        likes: post.likes.length || 0,
        likeCount: post.likes.length || 0, // Инициализируем likeCount
        comments: post.comments.length || 0,
        commentCount: post.comments.length,
        shares: post.shares?.length || 0,
      }));
      console.log(postsData);
      if (isNewRequest) {
        setPosts(postsData);
      } else {
        setPosts((prevPosts) => {
          const newPosts = postsData.filter(
            (post: Post) =>
              !prevPosts.some((existingPost) => existingPost.id === post.id)
          );
          return [...prevPosts, ...newPosts];
        });
      }

      setSkip((prevSkip) => prevSkip + 10);

      if (postsData.length < 10) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Ошибка при получении записей:', error);
    }
  };

  const handleTagClick = (tag: any) => {
    // Сбрасываем пагинацию и загружаем посты по тегу
    setSkip(0);
    fetchPosts(true, tag);
  };

  useEffect(() => {
    fetchPosts(true);
  }, []);

  useEffect(() => {
    if (socket) {
      socket.onmessage = async (received) => {
        const data = JSON.parse(received.data);
        if (data?.command === 'newComment' && data?.data?.postId) {
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === data?.data?.postId
                ? { ...post, commentCount: post.commentCount + 1 } // Увеличиваем счетчик комментариев
                : post
            )
          );
        }
        // Обработка обновления лайка
        if (data?.command === 'likeUpdate' && data?.data?.postId) {
          // setPosts(prevPosts =>
          //     prevPosts.map(post => {
          //         if (post.id === data.data.postId) {
          //             const likesArray = Array.isArray(post.likes) ? post.likes : [];
          //             const isLiked = data.data.isLiked;
          //             const updatedLikes = isLiked
          //                 ? [...likesArray, data.data.userId]
          //                 : likesArray.filter((id: string) => id !== data.data.userId);
          //             return {
          //                 ...post,
          //                 likes: updatedLikes,
          //                 likeCount: updatedLikes.length // Обновляем likeCount
          //             };
          //         }
          //         return post;
          //     })
          // );
          fetchPosts(true);
        }

        // Обработка нового поста
        if (data?.command === 'newPost') {
          fetchPosts(true);
          // setPosts(prevPosts => [data.post, ...prevPosts]);
        }

        if (data?.command === 'deletePost') {
          fetchPosts(true);
          // setPosts(prevPosts => [data.post, ...prevPosts]);
        }

        if (
          data?.command === 'deleteComment' &&
          data?.data?.postId &&
          data?.data?.commentId
        ) {
          fetchPosts(true);
        }

        if (data?.command === 'updatePost' && data?.data?.postId) {
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === data.data.postId
                ? { ...post, content: data.data.content }
                : post
            )
          );
        }
      };
    }
  }, [socket]);

  const renderContentWithHashtags = (text: any) => {
    return text.split(' ').map((word: any, index: any) =>
      word.startsWith('#') ? (
        <span
          key={index}
          className='cursor-pointer text-blue-500 hover:underline'
          onClick={() => handleTagClick(word.slice(1))}
        >
          {word}{' '}
        </span>
      ) : (
        word + ' '
      )
    );
  };

  const handleRecordingComplete = (audioBlob: Blob) => {
    console.log('Размер файла:', audioBlob.size);
    console.log('Тип файла:', audioBlob.type);

    const wavFile = new File([audioBlob], 'recording.wav', {
      type: 'audio/wav',
    });
    setFiles((prevFiles) => [...prevFiles, wavFile]);
  };

  return (
    <div className='mb-8 min-h-screen max-w-3xl space-y-6 rounded-lg bg-white p-0 text-black dark:bg-secondary/60 dark:text-white'>
      {/* Post creation section */}
      <div className='relative'>
        <input
          type='text'
          placeholder='Поиск по тегам...'
          className='w-full rounded-full border border-gray-300 px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500'
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <FaSearch className='absolute left-4 top-1/2 -translate-y-1/2 transform text-gray-500' />
      </div>
      {!selectedPost ? (
        <div>
          <div className='fixed bottom-[60px] z-10  flex w-full max-w-3xl flex-col rounded-none bg-secondary p-4 md:bottom-[0px] '>
            <div className='flex items-center space-x-4'>
              <div className='flex w-full flex-col gap-1.5 rounded-[26px] bg-gray-600 p-1.5 transition-colors dark:bg-gray-700'>
                <div className='flex items-end gap-1.5 md:gap-2'>
                  <div className='relative flex items-center'>
                    <button
                      type='button'
                      aria-label='Attach files'
                      className='flex h-8 w-8 items-center justify-center rounded-full text-white focus:outline-none dark:text-white'
                      onClick={() =>
                        document.getElementById('file-input')?.click()
                      }
                    >
                      <FaPaperclip size={18} />
                    </button>
                    <input
                      type='file'
                      id='file-input'
                      multiple
                      onChange={handleFileChange}
                      className='hidden'
                    />
                  </div>
                  <div className='flex min-w-0 flex-1 flex-col'>
                    <textarea
                      rows={1}
                      placeholder='Ваш пост здесь..'
                      className='m-0 max-h-52 max-h-[25vh] resize-none border-0 bg-transparent px-0 text-gray-900 focus:ring-0 focus-visible:ring-0 dark:text-white'
                      style={{ height: '30px', overflowY: 'hidden' }}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
                  <AudioRecorder
                    onRecordingComplete={handleRecordingComplete}
                  />

                  <button
                    onClick={handleSubmit}
                    disabled={
                      isLoading || (!content.trim() && files.length === 0)
                    }
                    aria-label='Поделиться'
                    className={`mb-1 me-1 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-opacity hover:opacity-70 focus:outline-none dark:bg-white dark:text-black ${
                      !content.trim() && files.length === 0
                        ? 'cursor-not-allowed opacity-50'
                        : ''
                    }`}
                  >
                    {isLoading ? (
                      <FaSpinner className='animate-spin' size={16} />
                    ) : (
                      <FaArrowRight size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
            {files.length > 0 && (
              <div className='mt-4'>
                <h4 className='text-sm font-medium text-gray-300'>
                  Прикрепленные файлы:
                </h4>
                <ul className='mt-2 list-inside list-disc text-gray-400'>
                  {files.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <InfiniteScroll
            dataLength={posts.length}
            next={() => fetchPosts()}
            hasMore={hasMore}
            loader={
              <div className='flex flex-col space-y-4 px-4 py-4'>
                <Skeleton className='h-6 w-3/4' />
                <Skeleton className='h-6 w-full' />
                <Skeleton className='h-6 w-5/6' />
                <Skeleton className='h-6 w-2/3' />
                <Skeleton className='h-6 w-1/2' />
              </div>
            }
            endMessage={<p className='text-center'>Больше нет постов</p>}
          >
            {posts.map((post, index) => (
              <div
                key={index}
                className='mb-4 space-y-4 rounded-none bg-secondary p-4'
              >
                <div className='flex items-center space-x-4'>
                  <Avatar className='mr-0'>
                    <Link href={`/profiles/${post?.user?.Name}`} passHref>
                      <AvatarImage
                        src={`https://proxy.myru.online/100/https://img.myru.online/${post?.user?.Photo}`}
                        alt={post?.user?.Photo}
                      />
                    </Link>
                  </Avatar>
                  <div className='flex-1'>
                    <Link href={`/profiles/${post?.user?.Name}`} passHref>
                      <p className='text-sm'>
                        <span className='font-semibold'>
                          {post?.user?.Name}
                        </span>
                      </p>
                      <p className='text-xs text-gray-400'>
                        {timeAgo(post.created_at)}
                      </p>
                    </Link>
                  </div>
                  {post.user.ID === userData?.id && (
                    <>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className='text-gray-400 hover:text-gray-300'>
                            <FaEllipsisV />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => handleEdit(post.id)}>
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(post.id)}
                          >
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>

                {post.files && post.files.length > 0 && (
                  <div className='mt-4'>
                    {post.files.filter(
                      (file) =>
                        file.url.endsWith('.jpeg') ||
                        file.url.endsWith('.jpg') ||
                        file.url.endsWith('.png') ||
                        file.url.endsWith('.gif') ||
                        file.url.endsWith('.mp4') ||
                        file.url.endsWith('.mkv') ||
                        file.url.endsWith('.mov')
                    ).length > 1 ? (
                      <Carousel className='w-full md:max-w-md'>
                        <CarouselContent>
                          {post.files
                            .filter(
                              (file) =>
                                file.url.endsWith('.jpeg') ||
                                file.url.endsWith('.jpg') ||
                                file.url.endsWith('.png') ||
                                file.url.endsWith('.gif') ||
                                file.url.endsWith('.mp4') ||
                                file.url.endsWith('.mkv') ||
                                file.url.endsWith('.mov')
                            )
                            .map((file, idx) => {
                              const { url, filename } = file;
                              const sanitizedUrl = url.replace(
                                '../server-data/img-store/',
                                ''
                              );
                              const fileUrlImage = `https://proxy.myru.online/256/https://img.myru.online/${sanitizedUrl}`;
                              const fileUrl = `https://img.myru.online/${sanitizedUrl}`;

                              if (
                                url.endsWith('.jpeg') ||
                                url.endsWith('.jpg') ||
                                url.endsWith('.png') ||
                                url.endsWith('.gif')
                              ) {
                                return (
                                  <CarouselItem key={idx}>
                                    <div className='max-h-md relative h-80 w-full'>
                                      <Image
                                        src={fileUrlImage}
                                        alt={filename}
                                        layout='fill'
                                        objectFit='cover'
                                      />
                                    </div>
                                  </CarouselItem>
                                );
                              } else if (
                                url.endsWith('.mp4') ||
                                url.endsWith('.mkv') ||
                                url.endsWith('.mov')
                              ) {
                                return (
                                  <CarouselItem key={idx}>
                                    <div className='relative h-full w-full'>
                                      <CustomPlayer url={fileUrl} />
                                    </div>
                                  </CarouselItem>
                                );
                              }
                            })}
                        </CarouselContent>
                        <CarouselPrevious className='left-3' />
                        <CarouselNext className='right-3' />
                      </Carousel>
                    ) : (
                      post.files.map((file, idx) => {
                        const { url, filename } = file;
                        const sanitizedUrl = url.replace(
                          '../server-data/img-store/',
                          ''
                        );
                        const fileUrlImage = `https://proxy.myru.online/256/https://img.myru.online/${sanitizedUrl}`;
                        const fileUrl = `https://img.myru.online/${sanitizedUrl}`;

                        if (
                          url.endsWith('.jpeg') ||
                          url.endsWith('.jpg') ||
                          url.endsWith('.png') ||
                          url.endsWith('.gif')
                        ) {
                          return (
                            <div
                              key={idx}
                              className='max-h-md relative h-80 max-w-md'
                            >
                              <Image
                                src={fileUrlImage}
                                alt={filename}
                                layout='fill'
                                objectFit='cover'
                              />
                            </div>
                          );
                        } else if (
                          url.endsWith('.mp4') ||
                          url.endsWith('.mkv') ||
                          url.endsWith('.mov')
                        ) {
                          return (
                            <div key={idx} className='relative h-full w-full'>
                              <CustomPlayer url={fileUrl} />
                            </div>
                          );
                        }
                      })
                    )}

                    {/* Отображение остальных файлов */}
                    {post.files
                      .filter(
                        (file) =>
                          !file.url.endsWith('.jpeg') &&
                          !file.url.endsWith('.jpg') &&
                          !file.url.endsWith('.png') &&
                          !file.url.endsWith('.gif') &&
                          !file.url.endsWith('.mp4') &&
                          !file.url.endsWith('.mkv') &&
                          !file.url.endsWith('.mov')
                      )
                      .map((file, idx) => renderFile(file, idx))}
                  </div>
                )}

                {post.isEditing ? (
                  <div>
                    <Textarea
                      className='w-full bg-transparent text-[16px] text-gray-400 placeholder-gray-500 focus:outline-none'
                      value={post.content}
                      onChange={(e) =>
                        setPosts((prevPosts) =>
                          prevPosts.map((p) =>
                            p.id === post.id
                              ? { ...p, content: e.target.value }
                              : p
                          )
                        )
                      }
                    />
                    <button
                      className={`mt-2 flex items-center rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 ${post.isSaving ? 'cursor-not-allowed opacity-50' : ''}`}
                      onClick={() => handleSaveEdit(post.id, post.content)}
                      disabled={post.isSaving}
                    >
                      {post.isSaving ? (
                        <FaSpinner className='mr-2 animate-spin' />
                      ) : null}
                      {post.isSaving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                  </div>
                ) : (
                  <LongText
                    text={renderContentWithHashtags(post.content)}
                    maxLength={300}
                  />
                )}

                <div className='flex justify-between text-gray-400'>
                  <div className='flex space-x-4'>
                    <span
                      className='cursor-pointer'
                      onClick={() => handleToggleLike(post.id)}
                    >
                      👍 {post.likeCount}
                    </span>
                    <span
                      className='cursor-pointer'
                      onClick={() => handleCommentClick(post)}
                    >
                      💬 {post.commentCount}
                    </span>
                    {/* <span>🔄 {post.shares}</span> */}
                  </div>
                </div>
              </div>
            ))}
          </InfiniteScroll>
        </div>
      ) : (
        <NestedCommentSection post={selectedPost} onBack={handleBackToPosts} />
      )}
    </div>
  );
}
