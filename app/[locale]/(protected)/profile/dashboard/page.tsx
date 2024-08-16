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

type Post = {
    id: string;
    username: string;
    avatar: string;
    content: string;
    created_at: string;
    likes: any[];  // Исправьте тип для соответствия структуре данных
    comments: any[];  // Исправьте тип для соответствия структуре данных
    shares: any[];  // Если есть `shares`, также укажите его тип как массив
    files: FilePost[];
    isEditing?: boolean; 
    isSaving?: boolean; // Добавляем состояние сохранения

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

    if (years > 0) {
        return `${years} ${years === 1 ? 'год' : 'лет'} назад`;
    } else if (months > 0) {
        return `${months} ${months === 1 ? 'месяц' : 'месяцев'} назад`;
    } else if (days > 0) {
        return `${days} ${days === 1 ? 'день' : 'дней'} назад`;
    } else if (hours > 0) {
        return `${hours} ${hours === 1 ? 'час' : 'часов'} назад`;
    } else if (minutes > 0) {
        return `${minutes} ${minutes === 1 ? 'минута' : 'минут'} назад`;
    } else {
        return `${seconds} ${seconds === 1 ? 'секунда' : 'секунд'} назад`;
    }
}

export default function DashboardPage() { 
    const { user: userData } = useContext(PaxContext);
    const [content, setContent] = useState(''); // Состояние для текста поста
    const [files, setFiles] = useState<File[]>([]); // Состояние для файлов
    const [isLoading, setIsLoading] = useState(false); // Состояние для управления загрузкой
    const [posts, setPosts] = useState<Post[]>([]); // Состояние для хранения записей
    const [skip, setSkip] = useState<number>(0); // Состояние для пропуска записей
    const [hasMore, setHasMore] = useState<boolean>(true); // Состояние для проверки наличия еще постов

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    };

    const renderFile = (file: any) => {
        const { url, filename } = file;
        const sanitizedUrl = url.replace('../server-data/img-store/', '');
        const fileUrl = `https://proxy.myru.online/256/https://img.myru.online/${sanitizedUrl}`;
        
        if (url.endsWith('.jpeg') || url.endsWith('.jpg') || url.endsWith('.png') || url.endsWith('.gif')) {
            return (
                <img src={fileUrl} alt={filename} className="w-full h-auto rounded-lg mb-4 max-w-md" />
            );
        } else if (url.endsWith('.mp4') || url.endsWith('.mkv')) {
            return (
                <video controls className="w-full h-auto rounded-lg mb-4">
                    <source src={fileUrl} type="video/mp4" />
                    <source src={fileUrl} type="video/x-matroska" />
                    Your browser does not support the video tag.
                </video>
            );
        } else if (url.endsWith('.pdf')) {
            return (
                <div className="mb-4">
                    <a href={fileUrl} download className="text-blue-500 hover:underline mt-2 block">
                        Скачать файл{filename}
                    </a>
                </div>
            );
        } else if (url.endsWith('.doc') || url.endsWith('.docx') || url.endsWith('.xls') || url.endsWith('.xlsx')) {
            return (
                <a href={fileUrl} download className="text-blue-500 hover:underline">
                        Скачать файл{filename}
                </a>
            );
        } else if (url.endsWith('.mp3') || url.endsWith('.wav')) {
            return (
                <ReactAudioPlayer
                    src={fileUrl}
                    className="w-full h-auto mb-4"
                />
            );
        } else {
            return (
                <a href={fileUrl} download className="text-blue-500 hover:underline">
                    {filename}
                </a>
            );
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
            formData.append('content', content); // Добавляем текст

            files.forEach(file => {
                formData.append('files', file); // Добавляем файлы
            });

            const res = await fetch('/api/post/add', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                throw new Error('Failed to create post');
            }

            toast.success('Пост создан'), {
                position: 'top-right',
            }

            setContent(''); // Очистка поля текста
            setFiles([]); // Очистка списка файлов
            setSkip(0); // Сброс skip после создания нового поста
            fetchPosts(true); // Загрузка обновленных постов
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
            toast.success('Пост обновлен', { position: 'top-right' });
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

            setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
            toast.success('Пост удален', { position: 'top-right' });
        } catch (error) {
            toast.error('Ошибка при удалении поста', { position: 'top-right' });
        }
    };

    // Функция для получения записей с сервера
    const fetchPosts = async (isNewRequest = false) => {
        try {
            const res = await fetch(`/api/post/get?skip=${isNewRequest ? 0 : skip}&limit=10`);
            if (!res.ok) {
                throw new Error('Failed to fetch posts');
            }
            const result = await res.json();
    
            const postsData = result.data.map((post: Post) => ({
                ...post,
                likes: post.likes.length || 0,  // Обработка массива лайков
                comments: post.comments.length || 0,  // Обработка массива комментариев
                shares: post.shares?.length || 0,  // Обработка массива шеров (если он есть)
            }));
    
            // Обновляем состояние постов
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
    
            // Проверка, если больше нет постов для загрузки
            if (postsData.length < 10) {
                setHasMore(false); // Отключаем загрузку новых постов, если загружены все
            }
        } catch (error) {
            console.error('Ошибка при получении записей:', error);
        }
    };
    
    useEffect(() => {
        fetchPosts(true);
    }, []);

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

            {/* Display attached files */}
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
    
          {/* Post display section with InfiniteScroll */}
          <InfiniteScroll
            dataLength={posts.length}
            next={() => fetchPosts()}
            hasMore={hasMore}
            loader={<h4>Загрузка...</h4>}
            endMessage={<p>Больше нет постов</p>}
          >
            {posts.map((post, index) => (
                <div key={index} className="bg-secondary p-4 mb-4 rounded-lg space-y-4">
                    <div className="flex items-center space-x-4">
                        <Avatar className='mr-3'>
                            <AvatarImage
                                src={`https://proxy.myru.online/100/https://img.myru.online/${userData?.avatar}`}
                                alt={userData?.username}
                            />
                        </Avatar>
                        <div className="flex-1">
                            <p className="text-sm">
                                <span className="font-semibold">{userData?.username}</span>
                            </p>
                            <p className="text-xs text-gray-400">{timeAgo(post.created_at)}</p>
                        </div>

                        {/* Dropdown menu for post options */}
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
                    </div>
                    
                    {/* Render files (photos, videos, etc.) first */}
                    {post.files && post.files.length > 0 && (
                        <div className="mt-4">
                            {post.files.map((file, idx) => (
                                <div key={idx}>
                                    {renderFile(file)}
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Render text content */}
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
                        <p className='break-all'>{post.content}</p>
                    )}

                    <div className="flex justify-between text-gray-400">
                        <div className="flex space-x-4">
                            <span>👍 {post.likes}</span>
                            <span>💬 {post.comments}</span>
                            <span>🔄 {post.shares}</span>
                        </div>
                    </div>
                </div>
            ))}
          </InfiniteScroll>
        </div>
    );
}
