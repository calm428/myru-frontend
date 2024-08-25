import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';
import { timeAgo } from '@/helpers/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FaReply, FaTimes, FaPaperclip, FaArrowRight } from 'react-icons/fa';
import { IoMdArrowBack } from 'react-icons/io';

type User = {
  ID: string;
  Name: string;
  Photo: string;
};

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
  likes: any[];
  likeCount: number;
  comments: any[];
  commentCount: number;
  shares: any[];
  files: FilePost[];
  user: User;
};

type Comment = {
  id: string;
  content: string;
  user: {
    Name: string;
    Photo: string;
  };
  created_at: string;
  replies: Comment[];
};

type CollapseState = {
  [key: string]: boolean;
};

type NestedCommentSectionProps = {
  post: Post;
  onBack: () => void;
};

export default function NestedCommentSection({
  post,
  onBack,
}: NestedCommentSectionProps) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [isCommentLoading, setIsCommentLoading] = useState<boolean>(false);
  const [replyVisible, setReplyVisible] = useState<string | null>(null);
  const [collapseState, setCollapseState] = useState<CollapseState>({});
  const [quote, setQuote] = useState<{ name: string; content: string } | null>(
    null
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchComments(post.id);
  }, [post.id]);

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, document.body.scrollHeight);
    }, 0);
  }, [comments]);

  const fetchComments = async (postId: string) => {
    try {
      setIsCommentLoading(true);
      const res = await fetch(`/api/post/${postId}/comments`);
      if (!res.ok) {
        throw new Error('Failed to fetch comments');
      }
      const result = await res.json();
      setComments(result.data);
    } catch (error) {
      console.error('Ошибка при получении комментариев:', error);
    } finally {
      setIsCommentLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!message.trim()) return;

    setIsCommentLoading(true);
    try {
      const res = await fetch(`/api/post/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: message }),
      });

      if (!res.ok) {
        throw new Error('Failed to add comment');
      }

      await fetchComments(post.id);

      setMessage('');
      setReplyVisible(null);
      setQuote(null);
    } catch (error) {
      toast.error('Ошибка при добавлении комментария', {
        position: 'top-right',
      });
    } finally {
      setIsCommentLoading(false);
    }
  };

  const handleReply = (comment: Comment) => {
    setQuote({ name: comment.user.Name, content: comment.content });
    setReplyVisible(comment.id);
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comment/${post.id}/delete/${commentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete comment');
      }

      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      );
    } catch (error) {
      toast.error('Ошибка при удалении комментария', { position: 'top-right' });
    }
  };

  const toggleCollapse = (commentId: string) => {
    setCollapseState((prevState) => ({
      ...prevState,
      [commentId]: !prevState[commentId],
    }));
  };

  const renderComments = (comments: Comment[], level: number = 0) => {
    return comments.map((comment) => (
      <div
        key={comment.id}
        className={`mb-4 w-full rounded-lg bg-secondary p-4 shadow-md ml-${level * 4} transition-colors duration-200`}
      >
        <div className='mb-2 flex items-center space-x-2'>
          <Avatar className='mr-3'>
            <AvatarImage
              src={`https://proxy.myru.online/50/https://img.myru.online/${comment.user?.Photo}`}
              alt={comment.user?.Name}
            />
          </Avatar>
          <div className='flex flex-col'>
            <span className='font-bold text-gray-900 dark:text-gray-100'>
              {comment.user?.Name}
            </span>
            <span className='text-gray-400'>{timeAgo(comment.created_at)}</span>
          </div>
        </div>
        <p className='mb-2 text-gray-800 dark:text-gray-300'>
          {comment.content}
        </p>
        <div className='flex items-center space-x-4'>
          <button
            onClick={() => handleReply(comment)}
            className='text-blue-500 dark:text-blue-400'
          >
            Ответить
          </button>
          <button
            onClick={() => handleDeleteComment(comment.id)}
            className='text-xs text-red-500 hover:text-red-600 dark:text-red-400'
          >
            Удалить
          </button>
        </div>
        {!collapseState[comment.id] &&
          comment.replies &&
          renderComments(comment.replies, level + 1)}
      </div>
    ));
  };

  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      handleGesture();
    };

    const handleGesture = () => {
      if (touchEndX - touchStartX > 50) {
        // Свайп вправо
        onBack();
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onBack]);

  return (
    <div>
      {/* <button onClick={onBack} className="mb-4 bg-blue-500 text-white px-4 py-2 rounded fixed z-10">
                Назад
            </button> */}
      <div className='px-4'>
        <div className='mb-4 flex min-h-screen w-full flex-col	items-center	justify-end justify-items-center'>
          {isCommentLoading ? (
            <>
              <Skeleton className='mb-4 h-6 w-1/2 dark:bg-gray-700' />
              <Skeleton className='mb-2 h-4 w-full dark:bg-gray-700' />
              <Skeleton className='mb-2 h-4 w-full dark:bg-gray-700' />
              <Skeleton className='mb-2 h-4 w-3/4 dark:bg-gray-700' />
            </>
          ) : comments.length > 0 ? (
            renderComments(comments)
          ) : (
            <p className='text-sm text-gray-400 dark:text-gray-500'>
              Нет комментариев.
            </p>
          )}
          <div className='sticky bottom-[70px] ml-[0px] mt-0 w-full p-4 pl-[0px] pr-[0px] md:bottom-[30px]'>
            {quote && (
              <ScrollArea>
                <div className='mb-4 flex items-start space-x-2 rounded-lg border-l-4 border-blue-500 bg-gray-100 p-4 dark:bg-gray-800'>
                  <FaReply className='text-blue-500 dark:text-blue-400' />
                  <div>
                    <p className='font-bold text-blue-500 dark:text-blue-400'>
                      В ответ {quote.name}
                    </p>
                    <p className='text-black dark:text-white'>
                      {quote.content}
                    </p>
                  </div>
                  <button
                    onClick={() => setQuote(null)}
                    className='ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  >
                    <FaTimes />
                  </button>
                </div>
              </ScrollArea>
            )}
            <div className='flex w-full flex-col gap-1.5 rounded-[26px] bg-gray-600 p-1.5 transition-colors dark:bg-gray-700'>
              <div className='flex items-end gap-1.5 md:gap-2'>
                <div className='relative flex items-center'>
                  <button
                    type='button'
                    aria-label='back'
                    onClick={onBack}
                    className='flex h-8 w-8 items-center justify-center rounded-full text-white focus:outline-none dark:text-white'
                  >
                    <IoMdArrowBack size={16} />
                  </button>
                  {/* <button
                  type='button'
                  aria-label='Attach files'
                  className='flex h-8 w-8 items-center justify-center rounded-full text-white focus:outline-none dark:text-white'
                >
                  <FaPaperclip size={18} />
                </button> */}
                </div>
                <div className='flex min-w-0 flex-1 flex-col'>
                  <textarea
                    rows={1}
                    placeholder='Ваш комментарий'
                    className='m-0 max-h-52 max-h-[25vh] resize-none border-0 bg-transparent px-0 text-gray-900 focus:ring-0 focus-visible:ring-0 dark:text-white'
                    style={{ height: '30px', overflowY: 'hidden' }}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleAddComment}
                  disabled={!message.trim()}
                  aria-label='Добавить комментарий'
                  className={`mb-1 me-1 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-opacity hover:opacity-70 focus:outline-none dark:bg-white dark:text-black ${
                    !message.trim() ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  <FaArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
