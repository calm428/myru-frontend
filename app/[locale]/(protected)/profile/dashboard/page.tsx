"use client";
import { useState, useContext, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Textarea } from '@/components/ui/textarea';
import { FaCloudUploadAlt } from "react-icons/fa";
import { PaxContext } from '@/context/context';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import toast from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';
import ReactAudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import useSWR, { mutate } from 'swr';
import Link from 'next/link';
import CustomPlayer from '@/components/utils/customPlayer';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import Image from 'next/image';
import LongText from './longText';

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
  } from '@/components/ui/carousel';
  
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    likeCount: number;  // Новое поле для количества лайков
    comments: any[]; 
    commentCount: number;  // Новое поле для количества комментариев
    shares: any[];
    files: FilePost[];
    isEditing?: boolean; 
    isSaving?: boolean;
    user: User;  // Добавляем свойство user
 
};

function timeAgo(date: any) {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    function getPlural(n: number, one: string, few: string, many: string) {
        if (n % 10 === 1 && n % 100 !== 11) {
            return one;
        } else if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) {
            return few;
        } else {
            return many;
        }
    }

    if (years > 0) {
        return `${years} ${getPlural(years, 'год', 'года', 'лет')} назад`;
    } else if (months > 0) {
        return `${months} ${getPlural(months, 'месяц', 'месяца', 'месяцев')} назад`;
    } else if (days > 0) {
        return `${days} ${getPlural(days, 'день', 'дня', 'дней')} назад`;
    } else if (hours > 0) {
        return `${hours} ${getPlural(hours, 'час', 'часа', 'часов')} назад`;
    } else if (minutes > 0) {
        return `${minutes} ${getPlural(minutes, 'минута', 'минуты', 'минут')} назад`;
    } else {
        return `${seconds} ${getPlural(seconds, 'секунда', 'секунды', 'секунд')} назад`;
    }
}

const Skeleton = ({ className }: { className?: string }) => {
    return (
        <div className={`animate-pulse bg-gray-300 dark:bg-gray-700 rounded ${className}`}></div>
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

    const handleCommentClick = async (post: Post) => {
        setSelectedPost(post);
        await fetchComments(post.id);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    };

    const handleDeleteComment = async (postId: string, commentId: string) => {
        try {
            const res = await fetch(`/api/comment/${postId}/delete/${commentId}`, {
                method: 'DELETE',
            });
    
            if (!res.ok) {
                throw new Error('Failed to delete comment');
            }
    
            setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
            toast.success('Комментарий удален', { position: 'top-right' });
        } catch (error) {
            toast.error('Ошибка при удалении комментария', { position: 'top-right' });
        }
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

            setPosts(prevPosts => prevPosts.map(post => 
                post.id === postId ? { ...post, likes: updatedPost.likes } : post
            ));

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
        
        if (url.endsWith('.jpeg') || url.endsWith('.jpg') || url.endsWith('.png') || url.endsWith('.gif')) {
            return (
                <CarouselItem key={index}>
                    <div className='relative h-72 w-full'>
                        <Image
                            src={fileUrlImage}
                            alt={filename}
                            layout="fill"
                            objectFit="cover"
                        />
                    </div>
                </CarouselItem>
            );
        } else if (url.endsWith('.mp4') || url.endsWith('.mkv') || url.endsWith('.mov')) {
            return (
                <div key={index} className='relative h-72 w-full mb-4'>
                    <CustomPlayer url={fileUrl} />
                </div>
            );
        } else if (url.endsWith('.pdf')) {
            return (
                <div key={index} className="mb-4">
                    <a href={fileUrl} download className="text-blue-500 hover:underline mt-2 block">
                        Скачать файл {filename}
                    </a>
                </div>
            );
        } else if (url.endsWith('.doc') || url.endsWith('.docx') || url.endsWith('.xls') || url.endsWith('.xlsx')) {
            return (
                <div key={index}>
                    <a href={fileUrl} download className="text-blue-500 hover:underline">
                        Скачать файл {filename}
                    </a>
                </div>
            );
        } else if (url.endsWith('.mp3') || url.endsWith('.wav')) {
            return (
                <div key={index}>
                    <ReactAudioPlayer
                        src={fileUrlIAudio}
                        className="max-w-[400px] h-auto mb-4"
                    />
                </div>
            );
        } else {
            return (
                <div key={index}>
                    <a href={fileUrl} download className="text-blue-500 hover:underline">
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

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        setIsCommentLoading(true);
        try {
            const res = await fetch(`/api/post/${selectedPost?.id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: newComment }),
            });

            if (!res.ok) {
                throw new Error('Failed to add comment');
            }

            const comment = await res.json();
            await fetchComments(selectedPost?.id || '');


            if (socket && selectedPost) {
                socket.send(JSON.stringify({
                    command: 'newComment',
                    postId: selectedPost.id,
                    comment: comment
                }));
            }
    

            // setComments(prevComments => [...prevComments, comment]);
            setNewComment('');
            toast.success('Комментарий добавлен', { position: 'top-right' });
        } catch (error) {
            toast.error('Ошибка при добавлении комментария', { position: 'top-right' });
        } finally {
            setIsCommentLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!content && files.length === 0) {
            alert("Пожалуйста, добавьте текст или файл.");
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('content', content); 

            files.forEach(file => {
                formData.append('files', file);
            });

            const res = await fetch('/api/post/add', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                throw new Error('Failed to create post');
            }

            // toast.success('Пост создан', {
            //     position: 'top-right',
            // });

            const newPost = await res.json(); // Получаем данные нового поста из ответа сервера

            if (socket) {
                socket.send(JSON.stringify({
                    command: 'newPost',
                    post: newPost
                }));
            }
    

            setContent('');
            setFiles([]);
            // setSkip(0);
            // fetchPosts(true);
        } catch (error) {
            alert('Ошибка при создании поста');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (postId: string) => {
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post.id === postId ? { ...post, isEditing: true } : { ...post, isEditing: false }
            )
        );
    };

    const handleSaveEdit = async (postId: string, editedContent: string) => {
        setPosts(prevPosts =>
            prevPosts.map(post =>
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
    
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === postId
                        ? { ...post, content: editedContent, isEditing: false, isSaving: false }
                        : post
                )
            );
            // toast.success('Пост обновлен', { position: 'top-right' });
        } catch (error) {
            setPosts(prevPosts =>
                prevPosts.map(post =>
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
                socket.send(JSON.stringify({
                    command: 'deletePost',
                    postId: postId
                }));
            }

            // setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
            toast.success('Пост удален', { position: 'top-right' });
        } catch (error) {
            toast.error('Ошибка при удалении поста', { position: 'top-right' });
        }
    };

    const fetchPosts = async (isNewRequest = false) => {
        try {
            const res = await fetch(`/api/post/getfeed?skip=${isNewRequest ? 0 : skip}&limit=10`);
            if (!res.ok) {
                throw new Error('Failed to fetch posts');
            }
            const result = await res.json();
    
            const postsData = result.data.map((post: Post) => ({
                ...post,
                likes: post.likes.length || 0,  
                likeCount: post.likes.length || 0,  // Инициализируем likeCount
                comments: post.comments.length || 0,  
                commentCount: post.comments.length,
                shares: post.shares?.length || 0,  
            }));
            console.log(postsData)
            if (isNewRequest) {
                setPosts(postsData);
            } else {
                setPosts(prevPosts => {
                    const newPosts = postsData.filter((post: Post) => 
                        !prevPosts.some(existingPost => existingPost.id === post.id)
                    );
                    return [...prevPosts, ...newPosts];
                });
            }
    
            setSkip(prevSkip => prevSkip + 10);
    
            if (postsData.length < 10) {
                setHasMore(false); 
            }
        } catch (error) {
            console.error('Ошибка при получении записей:', error);
        }
    };
    
    useEffect(() => {
        fetchPosts(true);
    }, []);

    useEffect(() => {
        if (socket) {
            socket.onmessage = async (received) => {
                const data = JSON.parse(received.data);
                if (data?.command === 'newComment' && data?.data?.postId) {
                    setPosts(prevPosts =>
                        prevPosts.map(post =>
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

                if (data?.command === 'deleteComment' && data?.data?.postId && data?.data?.commentId) {
                    fetchPosts(true);
                }
                
                if (data?.command === 'updatePost' && data?.data?.postId) {
                    setPosts(prevPosts =>
                        prevPosts.map(post =>
                            post.id === data.data.postId
                            ? { ...post, content: data.data.content }
                            : post
                        )
                    );
                }
            };
        }
    }, [socket]);

    return (
        <div className="mx-auto bg-white dark:bg-secondary/60 text-black dark:text-white p-4 rounded-lg space-y-6 mb-8">
          {/* Post creation section */}
          <div className="bg-secondary p-4 rounded-lg">
            <div className="flex items-center space-x-4">
              <Textarea
                placeholder="Ваш пост здесь.."
                className="w-full bg-transparent focus:outline-none text-gray-400 placeholder-gray-500 text-[16px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-6 text-gray-400">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <FaCloudUploadAlt />
                  <span>Файлы</span>
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange} 
                    className="hidden"
                  />
                </label>
              </div>
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Загрузка...' : 'Поделиться'}
              </button>
            </div>

            {files.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-300">Прикрепленные файлы:</h4>
                    <ul className="list-disc list-inside text-gray-400 mt-2">
                        {files.map((file, index) => (
                            <li key={index}>
                                {file.name}
                            </li>
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
                <div className="flex flex-col space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-6 w-1/2" />
                </div>
            }
            endMessage={<p className='text-center'>Больше нет постов</p>}
          >
            {posts.map((post, index) => (
                <div key={index} className="bg-secondary p-4 mb-4 rounded-lg space-y-4">
                    <div className="flex items-center space-x-4">

                        <Avatar className='mr-3'>
                        <Link href={`/profiles/${post?.user?.Name}`} passHref>

                            <AvatarImage
                                src={`https://proxy.myru.online/100/https://img.myru.online/${post?.user?.Photo}`}
                                alt={post?.user?.Photo}
                            />
                        </Link>
                        </Avatar>
                        <div className="flex-1">
                        <Link href={`/profiles/${post?.user?.Name}`} passHref>

                            <p className="text-sm">
                                <span className="font-semibold">{post?.user?.Name}</span>
                            </p>
                            <p className="text-xs text-gray-400">{timeAgo(post.created_at)}</p>
                        </Link>
                        </div>
                        {post.user.ID === userData?.id && (
                        <>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="text-gray-400 hover:text-gray-300">
                                    <FaEllipsisV />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(post.id)}>
                                    Редактировать
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(post.id)}>
                                    Удалить
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </>
                        )}
                    </div>
                    
                    {post.files && post.files.length > 0 && (
                    <div className="mt-4">
                        {/* Слайдер для изображений */}
                        <Carousel className='w-full md:w-52'>
                            <CarouselContent>
                                {post.files
                                    .filter(file => file.url.endsWith('.jpeg') || file.url.endsWith('.jpg') || file.url.endsWith('.png') || file.url.endsWith('.gif'))
                                    .map((file, idx) => renderFile(file, idx))
                                }
                            </CarouselContent>
                            <CarouselPrevious className='left-3' />
                            <CarouselNext className='right-3' />
                        </Carousel>

                        {/* Отображение остальных файлов */}
                        {post.files
                            .filter(file => !file.url.endsWith('.jpeg') && !file.url.endsWith('.jpg') && !file.url.endsWith('.png') && !file.url.endsWith('.gif'))
                            .map((file, idx) => renderFile(file, idx))
                        }
                    </div>
                )}
                    
                    {post.isEditing ? (
                        <div>
                            <Textarea
                                className="w-full bg-transparent focus:outline-none text-gray-400 placeholder-gray-500 text-[16px]"
                                value={post.content}
                                onChange={(e) =>
                                    setPosts(prevPosts =>
                                        prevPosts.map(p =>
                                            p.id === post.id ? { ...p, content: e.target.value } : p
                                        )
                                    )
                                }
                            />
                            <button 
                                className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg mt-2 flex items-center ${post.isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => handleSaveEdit(post.id, post.content)}
                                disabled={post.isSaving}
                            >
                                {post.isSaving ? <FaSpinner className="animate-spin mr-2" /> : null}
                                {post.isSaving ? 'Сохранение...' : 'Сохранить'}
                            </button>
                        </div>
                    ) : (
                        <LongText text={post.content} maxLength={300} />
                    )}

                    <div className="flex justify-between text-gray-400">
                        <div className="flex space-x-4">
                            <span 
                                className="cursor-pointer" 
                                onClick={() => handleToggleLike(post.id)}
                            >
                                👍 {post.likeCount} 
                            </span>
                            <span
                                    className="cursor-pointer"
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
        
        {selectedPost && (
            <Dialog open={!!selectedPost} 
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    setSelectedPost(null);
                    setComments([]); // Очищаем комментарии при закрытии модального окна
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Комментарии</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className='md:overflow-y-scroll'>
                        {isCommentLoading ? (
                            <>
                                <Skeleton className="h-6 mb-4 w-1/2" />
                                <Skeleton className="h-4 mb-2 w-full" />
                                <Skeleton className="h-4 mb-2 w-full" />
                                <Skeleton className="h-4 mb-2 w-3/4" />
                            </>
                        ) : comments.length > 0 ? (
                            comments.map((comment, index) => (
                                <div key={index} className="p-2 mb-2 border-b border-gray-200">
                                    <div className="flex items-center space-x-4">
                                        <Avatar className="mr-3">
                                            <AvatarImage
                                                src={`https://proxy.myru.online/50/https://img.myru.online/${comment.user?.Photo}`}
                                                alt={comment.user?.Name}
                                            />
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-sm">{comment.user?.Name}</p>
                                            <p className="text-xs text-gray-400">{timeAgo(comment.created_at)}</p>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-sm break-all">{comment.content}</p>
                                    {(comment.user?.Name === userData?.username || selectedPost?.username === userData?.username) && (
                                        <button
                                            className="text-red-500 hover:text-red-600 text-xs"
                                            onClick={() => handleDeleteComment(selectedPost.id, comment.id)}
                                            >
                                            Удалить
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 text-sm">Нет комментариев.</p>
                        )}
                    </ScrollArea>
                    <DialogFooter className="flex flex-wrap items-end space-y-2">
                    
                        <div className='flex gap-4'>
                        <button
                            onClick={handleAddComment}
                            disabled={isCommentLoading}
                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
                        >
                            {isCommentLoading ? 'Добавление...' : 'Добавить комментарий'}
                        </button>
                        <button
                            onClick={() => {
                                setSelectedPost(null);
                                setComments([]); // Очищаем комментарии при закрытии модального окна
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
                        >
                            Закрыть
                        </button>
                        </div>
                        <Textarea
                            placeholder="Напишите комментарий..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full bg-transparent focus:outline-none text-gray-400 placeholder-gray-500 text-[16px]"
                        />
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )}
        </div>
    );
}
