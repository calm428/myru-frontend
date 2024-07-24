import { cn } from '@/lib/utils';
import { useChat, ReceivedChatMessage } from '@livekit/components-react';
import { useCallback, useMemo, useState, type KeyboardEvent } from 'react';
import { Button } from './ui/button';
import { Icons } from './ui/icons';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarImage } from '../ui/avatar';
import { useTranslations } from 'next-intl';

interface Props {
  participantName: string;
  messages: { type: 'system' | 'user'; message: string; timestamp: number; from?: { identity?: string; name?: string; metadata?: string } }[];
}

export default function Chat({ participantName, messages }: Props) {
  const t = useTranslations('main');

  const { chatMessages: chatMessagesFromServer, send } = useChat();

  const formattedChatMessagesFromServer = useMemo(() => {
    return chatMessagesFromServer.map(message => ({
      type: 'user',
      message: message.message,
      timestamp: message.timestamp,
      from: message.from,
    }));
  }, [chatMessagesFromServer]);

  const allMessages = useMemo(() => {
    return [...formattedChatMessagesFromServer, ...messages].sort((a, b) => b.timestamp - a.timestamp);
  }, [formattedChatMessagesFromServer, messages]);

  const [message, setMessage] = useState('');

  const onEnter = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (message.trim().length > 0 && send) {
          send(message).catch((err) => console.error(err));
          setMessage('');
        }
      }
    },
    [message, send]
  );

  const onSend = useCallback(() => {
    if (message.trim().length > 0 && send) {
      send(message).catch((err) => console.error(err));
      setMessage('');
    }
  }, [message, send]);

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 overflow-y-auto pt-[90%] md:pt-0' 
       style={{
        // height: '50%',
        WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
        maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
      }}>
        {allMessages.map((message, index) => (
          <div key={index} className='flex items-center gap-2 p-2'>
            <Avatar className='mr-3 size-10'>
              <AvatarImage
                src={`https://proxy.myru.online/100/https://img.myru.online/${message.from?.metadata || 'default.jpg'}`}
              />
            </Avatar>
            <div className='flex flex-col'>
              <div className='flex items-center gap-2'>
                <div
                  className={cn(
                    'text-xs font-semibold text-white md:text-white dark:text-white md:dark:text-white',
                    participantName === message.from?.identity && 'text-indigo-500'
                  )}
                >
                  {message.from?.name}
                  {participantName === message.from?.identity && ' (Вы)'}
                </div>
                <div className='text-xs text-gray-500'>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
              <div className='text-sm text-white md:text-white dark:text-white md:dark:text-white'>
                {message.type === 'system' ? (
                  <span className='italic'>{message.message}</span>
                ) : (
                  message.message
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className='flex-shrink-0 p-0 sticky bottom-0 bg-white dark:bg-zinc-900'>
        <Textarea
          value={message}
          className='border-box h-10'
          onChange={(e) => {
            setMessage(e.target.value);
          }}
          onKeyDown={onEnter}
          placeholder={t('type_message')}
        />
        <Button disabled={message.trim().length === 0} onClick={onSend} className='w-full mt-2'>
          <div className='flex items-center gap-2'>
            <Icons.send className='h-4 w-4' />
          </div>
        </Button>
      </div>
    </div>
  );
}
