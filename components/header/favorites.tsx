'use client';

import { PaxContext } from '@/context/context';
import { useContext, useEffect } from 'react';
import { CiHeart } from 'react-icons/ci';

import Link from 'next/link';
import eventBus from '@/lib/eventBus';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { useNotification } from '@/provider/notificationProvider';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function favorites({
  authenticated,
}: {
  authenticated: boolean;
}) {
  const { user, socket } = useContext(PaxContext);
  const { playNotificationSound } = useNotification();

  const { data, error, mutate } = useSWR('/api/fav/get', fetcher);

  if (!data) return null;

  const unreadCount = data?.data?.length || 0;

  return authenticated || user ? (
    <Link href='/profile/favorites'>
      <div className='relative'>
        <CiHeart size={24} />
        <span className='absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-500 text-xs text-white'>
          {unreadCount}
        </span>
      </div>
    </Link>
  ) : null;
}
