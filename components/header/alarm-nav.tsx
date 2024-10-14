'use client';

import { usePathname, useRouter } from 'next/navigation';
import eventBus from '@/eventBus';
import { PiChatCenteredTextThin } from 'react-icons/pi';
import { useContext, useEffect, useRef, useState } from 'react';
import { PaxContext } from '@/context/context';
import useCentrifuge from '@/hooks/useCentrifuge';
import getSubscribedRooms from '@/lib/server/chat/getSubscribedRooms';
import getUnsubscribedNewRooms from '@/lib/server/chat/getUnsubscribedNewRooms';

export default function AlarmNav({
  authenticated,
}: {
  authenticated: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [roomCount, setRoomCount] = useState(0);
  const { user } = useContext(PaxContext);
  const onPublication = useRef<any>(null);

  const checkMessagesInPathname = () => {
    if (pathname.includes('chat')) {
      eventBus.emit('startChat');
    } else {
      router.push('/chat?mode=true');
    }
  };

  useCentrifuge(user?.id, onPublication.current);

  const getRoomCount = async () => {
    try {
      const subscribedRooms = await getSubscribedRooms();
      const unSubscribedRooms = await getUnsubscribedNewRooms();

      return subscribedRooms.length + unSubscribedRooms.length;
    } catch (error) {
      return 0;
    }
  };

  useEffect(() => {
    getRoomCount().then((roomCount) => setRoomCount(roomCount));

    onPublication.current = (publication: any) => {
      if (publication.type === 'new_room') {
        setRoomCount((roomCount) => roomCount + 1);
      } else if (publication.type === 'unsubscribe_room') {
        setRoomCount((roomCount) => roomCount - 1);
      }
    };
  }, []);

  return authenticated || user ? (
    <div className='flex'>
      <button onClick={checkMessagesInPathname}>
        <div className='relative'>
          <PiChatCenteredTextThin size={24} />
          {roomCount > 0 && (
            <span className='absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-500 text-xs text-white'>
              {roomCount}
            </span>
          )}
        </div>
      </button>
    </div>
  ) : null;
}
