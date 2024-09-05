"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';
import { timeAgo } from '@/helpers/utils';

type Comment = {
    id: string;
    content: string;
    user: {
        Name: string;
        Photo: string;
    };
    created_at: string;
    replies: Comment[]; // Массив для хранения ответов
};

export default function CommentPage() {
    const { id } = useParams(); // Получаем ID поста из URL
    const router = useRouter(); // Инициализируем useRouter для управления маршрутом
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState<string>('');
    const [isCommentLoading, setIsCommentLoading] = useState<boolean>(false);
    const [replyVisible, setReplyVisible] = useState<string | null>(null);
    const [collapseState, setCollapseState] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const headerHeight = 181; // Высота заголовка в пикселях
        window.scrollTo(0, headerHeight); // Прокручиваем страницу на высоту заголовка

        if (typeof id === 'string') {
            fetchComments(id);
        }

    }, [id]);

    useEffect(() => {
        const savedScrollPosition = sessionStorage.getItem('scrollPosition');
        if (savedScrollPosition) {
            setTimeout(() => {
                window.scrollTo(0, parseInt(savedScrollPosition, 10));
                sessionStorage.removeItem('scrollPosition');
            }, 0);
        }
    }, [router]);

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

    const handleAddComment = async (parentId: string | null = null) => {
        if (!newComment.trim() || typeof id !== 'string') return;

        setIsCommentLoading(true);
        try {
            const res = await fetch(`/api/post/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: newComment, parentId }), // parentId для ответов
            });

            if (!res.ok) {
                throw new Error('Failed to add comment');
            }

            const comment = await res.json();
            await fetchComments(id);

            setNewComment('');
            setReplyVisible(null);
            toast.success('Комментарий добавлен', { position: 'top-right' });
        } catch (error) {
            toast.error('Ошибка при добавлении комментария', { position: 'top-right' });
        } finally {
            setIsCommentLoading(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (typeof id !== 'string') return;

        try {
            const res = await fetch(`/api/comment/${id}/delete/${commentId}`, {
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

    const toggleReply = (commentId: string) => {
        setReplyVisible(replyVisible === commentId ? null : commentId);
    };

    const toggleCollapse = (commentId: string) => {
        setCollapseState(prevState => ({
            ...prevState,
            [commentId]: !prevState[commentId],
        }));
    };

    const renderComments = (comments: Comment[], level: number = 0) => {
        return comments.map((comment) => (
            <div key={comment.id} className={`bg-white p-4 rounded-lg shadow-md mb-4 ml-${level * 4}`}>
                <div className="flex items-center space-x-2 mb-2">
                    <Avatar className="mr-3">
                        <AvatarImage
                            src={`https://proxy.myru.online/50/https://img.myru.online/${comment.user?.Photo}`}
                            alt={comment.user?.Name}
                        />
                    </Avatar>
                    <span className="font-bold">{comment.user?.Name}</span>
                    <span className="text-gray-400">{timeAgo(comment.created_at)}</span>
                </div>
                <p className="text-gray-800 mb-2">{comment.content}</p>
                <div className="flex items-center space-x-4">
                    <button onClick={() => toggleCollapse(comment.id)} className="text-blue-500">
                        {collapseState[comment.id] ? 'Развернуть' : 'Свернуть'}
                    </button>
                    <button onClick={() => toggleReply(comment.id)} className="text-blue-500">
                        Ответить
                    </button>
                    <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-500 hover:text-red-600 text-xs"
                    >
                        Удалить
                    </button>
                </div>
                {replyVisible === comment.id && (
                    <div className="ml-8 mt-4">
                        <Textarea
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Напишите ваш ответ..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <div className="flex items-center space-x-2 mt-2">
                            <button
                                onClick={() => handleAddComment(comment.id)}
                                disabled={isCommentLoading}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600"
                            >
                                {isCommentLoading ? 'Добавление...' : 'Отправить'}
                            </button>
                            <button onClick={() => toggleReply(comment.id)} className="text-gray-500">
                                Отменить
                            </button>
                        </div>
                    </div>
                )}
                {!collapseState[comment.id] && comment.replies && renderComments(comment.replies, level + 1)}
            </div>
        ));
    };

    return (
        <div className="max-w-3xl px-4 my-4">
            <h1 className="text-xl font-semibold mb-4">Комментарии</h1>
            <button
                    onClick={() => router.back()} // Возвращаемся на предыдущую страницу
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-600"
                >
                    Назад
            </button>
            <div className="mt-6 mb-4">
                <Textarea
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-[16px]"
                    placeholder="Напишите комментарий..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                    onClick={() => handleAddComment()}
                    disabled={isCommentLoading}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 mt-2"
                >
                    {isCommentLoading ? 'Добавление...' : 'Добавить комментарий'}
                </button>
            </div>
            {isCommentLoading ? (
                <>
                    <Skeleton className="h-6 mb-4 w-1/2" />
                    <Skeleton className="h-4 mb-2 w-full" />
                    <Skeleton className="h-4 mb-2 w-full" />
                    <Skeleton className="h-4 mb-2 w-3/4" />
                </>
            ) : comments.length > 0 ? (
                renderComments(comments)
            ) : (
                <p className="text-gray-400 text-sm">Нет комментариев.</p>
            )}
        </div>
    );
}
