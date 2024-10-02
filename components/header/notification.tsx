'use client';

import { PaxContext } from '@/context/context';
import { useContext, useEffect } from 'react';
import { IoIosNotificationsOutline } from 'react-icons/io';

import Link from 'next/link';
import eventBus from '@/lib/eventBus';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { useNotification } from '@/provider/notificationProvider';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Notification({
  authenticated,
}: {
  authenticated: boolean;
}) {
  const { user, socket } = useContext(PaxContext);
  const { playNotificationSound } = useNotification();

  const { data, error, mutate } = useSWR('/api/notifications/get', fetcher);

  useEffect(() => {
    const handleNotificationRead = () => {
      mutate();
    };

    eventBus.on('notificationRead', handleNotificationRead);

    return () => {
      eventBus.off('notificationRead', handleNotificationRead);
    };
  }, [mutate]);

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.command === 'new_notification') {
          playNotificationSound();
          toast.success('Для Вас новое уведомление');
          mutate();
        }
      };
    }
  }, [socket, mutate, playNotificationSound]);

  if (!data) return null;

  const unreadCount = data?.data?.unread || 0;

  return authenticated || user ? (
    <Link href='/profile/notifications'>
      <div className='relative'>
        <IoIosNotificationsOutline size={24} />
        <span className='absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white'>
          {unreadCount}
        </span>
      </div>
    </Link>
  ) : null;
}
