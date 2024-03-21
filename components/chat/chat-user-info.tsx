import { PaxChatContext } from '@/context/chat-context';
import { cn } from '@/lib/utils';
import { useContext, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { IoClose, IoLanguage } from 'react-icons/io5';
import useSWR from 'swr';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useTranslations } from 'next-intl';
import { BiSolidCalendar, BiSolidCategory } from 'react-icons/bi';
import { MdOutlineHouseSiding, MdOutlinePostAdd } from 'react-icons/md';
import { RiUserFollowFill } from 'react-icons/ri';
import { Skeleton } from '../ui/skeleton';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ChatUserInfo() {
  const t = useTranslations('main');
  const { showSidebar, setShowSidebar, chatUser } = useContext(PaxChatContext);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const { data, error } = useSWR(
    chatUser?.profile.name
      ? `/api/profiles/get/${chatUser?.profile.name}`
      : null,
    fetcher
  );

  useEffect(() => {
    console.log(data, error);
  }, [data, error]);

  return (
    <div
      ref={sidebarRef}
      className={cn(
        'fixed right-0 h-full w-[300px] bg-black transition-all duration-300',
        {
          'translate-x-full': !showSidebar,
        }
      )}
    >
      <Button
        variant='ghost'
        size='icon'
        className='absolute left-2 top-2 z-10 rounded-full'
        onClick={() => setShowSidebar(false)}
      >
        <IoClose size={20} />
      </Button>
      <div>
        <div className='relative h-72 w-full'>
          <Image
            src={chatUser?.profile.avatar || ''}
            alt=''
            fill
            style={{ objectFit: 'cover' }}
            className='z-0'
          />
          <div className='absolute bottom-4 left-2'>
            <p>@{chatUser?.profile.name}</p>
            <p className='text-xs text-gray-500'>
              {chatUser?.online ? 'online' : 'offline'}
            </p>
          </div>
          <div className='absolute bottom-2 right-2'>
            <div
              className={`right-0 top-[0.2rem] mr-0 rounded-md bg-cover bg-center bg-no-repeat`}
              style={{
                backgroundImage: `url('/images/${data?.country}.svg')`,
              }}
            >
              <div className='flex items-center justify-end rounded-md bg-black/50 px-2 text-white'>
                <IoLanguage />
                <span className='uppercase'>{data?.country}</span>
              </div>
            </div>
          </div>
        </div>
        <div className='mt-4 space-y-2 p-2'>
          <div>
            <span className='!text-xs text-muted-foreground'>Username</span>
            {data?.username ? (
              <p className='text-sm'>@{data?.username}</p>
            ) : (
              <Skeleton className='h-5 w-32' />
            )}
          </div>
          <div>
            <span className='!text-xs text-muted-foreground'>Bio</span>
            {data?.description ? (
              <p className='text-sm'>{data.description}</p>
            ) : (
              <Skeleton className='h-5 w-full' />
            )}
          </div>
          <Separator />
          <div>
            <div>
              <span className='flex items-center gap-1 !text-xs text-muted-foreground'>
                <MdOutlineHouseSiding className='size-3' />
                {t('city')}
              </span>
              {data?.cities ? (
                <div className='flex flex-wrap gap-2'>
                  {data.cities?.map((city: string, index: number) => (
                    <Link
                      key={index}
                      href={`/home?mode=profile&city=${city}`}
                      target='_blank'
                    >
                      <Badge
                        variant='outline'
                        className='mb-2 max-w-fit rounded-full bg-primary/10 p-1 px-2 text-sm text-primary hover:border-primary'
                      >
                        <p>{city}</p>
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <Skeleton className='h-6 w-full' />
              )}
            </div>
            <div>
              <span className='flex items-center gap-1 !text-xs text-muted-foreground'>
                <BiSolidCategory className='size-3' />
                {t('category')}
              </span>
              {data?.categories ? (
                <div className='flex flex-wrap gap-2'>
                  {data.categories?.map((category: string, index: number) => (
                    <Link
                      key={index}
                      href={`/home?mode=profile&city=${category}`}
                      target='_blank'
                    >
                      <Badge
                        variant='outline'
                        className='max-w-fit rounded-full bg-primary/10 p-1 px-2 text-sm text-primary hover:border-primary'
                      >
                        {category}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <Skeleton className='h-6 w-full' />
              )}
            </div>
          </div>
          <Separator />
          <div className='space-y-2'>
            <div>
              <span className='flex items-center gap-1 !text-xs text-muted-foreground'>
                <BiSolidCalendar className='size-3' />
                {t('online_status')}
              </span>
              {data?.review ? (
                <div className='text-sm'>
                  <div>
                    {t('this_month')}: {data?.review?.monthtime?.hour}h{' '}
                    {data.review?.monthtime?.minutes}m
                  </div>
                  <div>
                    {t('total')}: {data?.review?.totaltime?.hour}h{' '}
                    {data.review?.totaltime?.minutes}m
                  </div>
                </div>
              ) : (
                <Skeleton className='h-5 w-full' />
              )}
            </div>
            <div>
              <span className='flex items-center gap-1 !text-xs text-muted-foreground'>
                <MdOutlinePostAdd className='size-3' />
                {t('publications')}
              </span>
              {data?.review ? (
                <div className='text-sm'>
                  <div>
                    {t('this_month')}: {data.review?.monthposts}
                  </div>
                  <div>
                    {t('total')}: {data.review?.totalposts}
                  </div>
                </div>
              ) : (
                <Skeleton className='h-5 w-full' />
              )}
            </div>
            <div>
              <span className='flex items-center gap-1 !text-xs text-muted-foreground'>
                <RiUserFollowFill className='size-3' />
                {t('followers')}
              </span>
              {data?.review ? (
                <div className='text-sm'>
                  <div>
                    {t('total')}: {data.review?.followers}
                  </div>
                </div>
              ) : (
                <Skeleton className='h-5 w-full' />
              )}
            </div>
          </div>
          <Separator />
          <div>
            <span className='flex items-center gap-1 !text-xs text-muted-foreground'>
              {t('additional_info')}
            </span>
            {data?.additionalinfo ? (
              <div
                className='text-sm'
                dangerouslySetInnerHTML={{ __html: data?.additionalinfo || '' }}
              ></div>
            ) : (
              <div className='space-y-1'>
                <Skeleton className='h-5 w-full' />
                <Skeleton className='h-5 w-full' />
                <Skeleton className='h-5 w-full' />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
