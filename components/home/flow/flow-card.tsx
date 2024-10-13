import { useState } from 'react';

import { Eye, Mail } from 'lucide-react';
import Image from 'next/image';
import { BiLink } from 'react-icons/bi';
import { FaExclamation, FaTelegramPlane } from 'react-icons/fa';
import { IoLanguage } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, selectCartItems } from '@/store/cartSlice';

import { ProfileAvatar } from '@/components/common/profile-avatar';
import { TagSlider } from '@/components/common/tag-slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // Используем useRouter из next/navigation

import Link from 'next/link';
import { CategoryBadge } from './category-badge';
import { LocationBadge } from './location-badge';
import { PriceBadge } from './price-badge';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { ReportModal } from '@/components/common/report-modal';
import { LuBrainCircuit } from 'react-icons/lu';
import ShareButton from '@/components/ui/shareButton';
import { RiHeartAddFill } from 'react-icons/ri';
import { RiHeartFill } from 'react-icons/ri';
import dynamic from 'next/dynamic';
import { PaxContext } from '@/context/context';
import { getSessionData } from '@/app/[locale]/(auth)/auth/check-session';

const CartButton = dynamic(() => import('@/components/cart/CartButton'), {
  ssr: false,
});

export interface FlowCardProps {
  isFavorite: boolean;
  id: string;
  title: string;
  subtitle: string;
  user?: {
    username: string;
    online: boolean;
    telegram: string;
    avatar: string;
  };
  slug: string;
  hero: string;
  price: number;
  regularpost?: boolean;
  tags: string[];
  location: string;
  category: string;
  countrycode: string;
  review: {
    totalviews: number;
  };
  // callbackURL: string;
}

function FlowCard(profile: FlowCardProps) {
  const [isFavorite, setIsFavorite] = useState(profile.isFavorite);
  const { data: session, status } = useSession(); // Используем useSession для проверки авторизации
  const router = useRouter(); // Используем навигацию из next/navigation

  const t = useTranslations('main');
  const searchParams = useSearchParams();
  const {
    id,
    title,
    subtitle,
    user,
    slug,
    hero,
    price,
    regularpost,
    tags,
    location,
    category,
    countrycode,
    review,
    // isFavorite,
    // callbackURL,
  } = profile;

  const queries: { [key: string]: string } = {};

  for (let [key, value] of searchParams.entries()) {
    queries[key] = value;
  }

  const handleLinkCopy = async () => {
    await navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_WEBSITE_URL}/flows/${id}/${slug}`
    );

    toast.success(t('link_copied_to_clipboard'), {
      position: 'top-right',
    });
  };

  const saveScrollPosition = () => {
    if (window === undefined) return;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        'home-page-scroll-position',
        (window.scrollY || document.documentElement.scrollTop).toString()
      );
    }
  };

  const handleFavoriteToggle = async () => {
    // const accessToken = await getSessionData();

    // if (!accessToken) {
    //   const router = useRouter();
    //   router.push('/auth/signin');
    //   return;
    // }

    try {
      // Определяем тип действия в зависимости от текущего состояния
      const actionType = isFavorite ? 'remove' : 'add';

      const response = await fetch(`/api/flows/favorite`, {
        method: 'POST', // Используем только POST запрос
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, actionType }), // Передаем тип действия
      });

      if (response.ok) {
        // Обновляем локальное состояние после успешного запроса
        setIsFavorite(!isFavorite);
        toast.success('Изменен статус избранного'),
          {
            position: 'top-right',
          };
      } else {
        toast.error('Ошибка изменения статуса избранного'),
          {
            position: 'top-right',
          };
        console.error('Ошибка при изменении избранного статуса');
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    }
  };

  return (
    <Card className='size-full w-full'>
      <CardContent className='relative flex size-full flex-col gap-4 p-0'>
        <div className='relative'>
          <div className='max-h-auto h-auto min-h-[300px] w-full md:min-h-[416px] '>
            <Image
              src={hero}
              fill
              style={{ objectFit: 'cover' }}
              className='rounded-md rounded-b-none '
              alt='profile'
            />
          </div>
          <div className='absolute right-0 top-3 flex gap-2 px-3'>
            {/* {regularpost && (
              <Badge
                variant='default'
                className='border-none bg-black/50 p-2 text-white'
              >
                <LuBrainCircuit className='mr-2 size-4 text-white' />
              </Badge>
            )} */}
            <Badge
              variant='default'
              className='flex flex-col !items-center !justify-center border-none bg-gradient-to-r from-[#73a2ff] to-[#73a2ff] p-2 text-white'
            >
              <Eye className='mr-0 size-4 text-white' />
              {review.totalviews}
            </Badge>
          </div>

          <div className='absolute right-0 top-24 z-10 px-3'>
            {user && (
              <div className='flex flex-col items-center justify-end gap-2'>
                <ReportModal>
                  <Button
                    variant='default'
                    size='icon'
                    className='rounded-full'
                    data-tooltip-id='my-tooltip-1'
                  >
                    <FaExclamation className='size-4 text-white dark:text-white' />
                  </Button>
                </ReportModal>
                <Button
                  variant='default'
                  size='icon'
                  className='rounded-full'
                  data-tooltip-id='my-tooltip-2'
                  onClick={handleLinkCopy}
                >
                  <BiLink className='size-4 text-white dark:text-white' />
                </Button>
                {user.telegram && (
                  <Button
                    variant='default'
                    size='icon'
                    className='rounded-full'
                    data-tooltip-id='my-tooltip-3'
                    asChild
                  >
                    <Link
                      href={`tg://resolve?domain=${user.telegram}`}
                      target='_blank'
                    >
                      <FaTelegramPlane className='size-4 text-white dark:text-white' />
                    </Link>
                  </Button>
                )}
                <ShareButton
                  shareUrl={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/flows/${id}/${slug}`}
                  shareTitle={title}
                />

                <Button
                  variant='default'
                  size='icon'
                  className='rounded-full'
                  data-tooltip-id='my-tooltip-5'
                  onClick={handleFavoriteToggle}
                >
                  {isFavorite ? <RiHeartFill /> : <RiHeartAddFill />}
                </Button>
                <ReactTooltip
                  id='my-tooltip-1'
                  place='bottom'
                  content={t('send_report')}
                />
                <ReactTooltip
                  id='my-tooltip-2'
                  place='bottom'
                  content={t('copy_link')}
                />
                <ReactTooltip
                  id='my-tooltip-3'
                  place='bottom'
                  content={t('open_telegram_chat')}
                />
                <ReactTooltip
                  id='my-tooltip-5'
                  place='bottom'
                  content={
                    isFavorite
                      ? 'Удалить из избранного'
                      : 'Добавить в избранное'
                  }
                />
              </div>
            )}
          </div>
          <Link
            key={`flow-link-${id}`}
            href='/flows/[id]/[slug]'
            as={`/flows/${id}/${slug}`}
            onClick={saveScrollPosition}
          >
            <div className='absolute bottom-0 z-10'>
              <div className='px-3 font-satoshi'>
                <div className='line-clamp-1 text-xl font-semibold text-secondary-foreground'>
                  <Link
                    key={`title-link-${id}`}
                    href='/flows/[id]/[slug]'
                    as={`/flows/${id}/${slug}`}
                    onClick={saveScrollPosition}
                  >
                    {title}
                  </Link>
                </div>
                <div className='text-muted-foregroun line-clamp-3 break-all text-sm'>
                  {subtitle}
                </div>
                {/* <button className='text-xs'>Открыть карточку</button> */}
              </div>
            </div>
          </Link>
          <div className='absolute inset-0 flex items-center justify-center rounded-t-md bg-gradient-to-b from-transparent via-transparent to-white dark:to-black'></div>
        </div>
        <div className='relative w-full max-w-[100%] px-3'>
          <TagSlider tags={tags} />
        </div>
        <div className='mb-2 mt-auto flex flex-wrap items-stretch gap-3 px-3'>
          {' '}
          {/* Добавляем items-stretch */}
          {price !== 0 && (
            <div className='flex min-w-[calc(50%-0.75rem)] flex-1'>
              <Link
                key={`price-link-${id}`}
                className='h-full w-full'
                href={{ query: { ...queries, money: price } }}
              >
                <PriceBadge className='flex h-full flex-grow items-center justify-center'>
                  {' '}
                  {/* Добавляем h-full */}
                  {price.toLocaleString('ru-RU', {
                    style: 'currency',
                    currency: 'RUB',
                    maximumFractionDigits: 0,
                  })}
                </PriceBadge>
              </Link>
            </div>
          )}
          <div className='flex min-w-[calc(50%-0.75rem)] flex-1'>
            <Link
              key={`location-link-${id}`}
              className='h-full w-full'
              href={{ query: { ...queries, city: location, page: 0 } }}
            >
              <LocationBadge className='flex h-full flex-grow items-center justify-center'>
                {' '}
                {/* Добавляем h-full */}
                {location}
              </LocationBadge>
            </Link>
          </div>
          <div className='flex w-full'>
            <Link
              key={`category-link-${id}`}
              className='h-full w-full'
              href={{ query: { ...queries, category: category, page: 0 } }}
            >
              <CategoryBadge className='flex h-full flex-grow items-center justify-center'>
                {' '}
                {/* Добавляем h-full */}
                {category}
              </CategoryBadge>
            </Link>
          </div>
        </div>
        <div className='flex gap-2 px-2 pb-2'>
          <Link
            key={`flow-link-${id}`}
            href='/flows/[id]/[slug]'
            as={`/flows/${id}/${slug}`}
            onClick={saveScrollPosition}
          >
            {' '}
            <Button className='!w-full !text-xs'>Открыть товар</Button>
          </Link>
          <CartButton
            id={profile.id.toString()}
            title={profile.title}
            image={hero}
            price={profile.price}
            quantity={1}
            seller={profile.user?.username || ''} // Проверка на наличие username
          />

          {/* <Button
            className='!w-full !text-xs'
            onClick={handleAddToCart}
            disabled={isInCart} // Если товар уже в корзине, кнопка отключена
          >
            {isInCart ? 'В корзине' : 'В корзину'}
          </Button> */}
        </div>
        {/*         
        {user && (
          <div className='grid grid-cols-1 px-3 pb-3'>
            <div className='col-span-1'>
              <Link
                key={`profile-link-${id}`}
                href='/profiles/[username]'
                as={`/profiles/${user.username}`}
                onClick={saveScrollPosition}
              >
                <div className='flex gap-2'>
                  <ProfileAvatar
                    src={user.avatar}
                    username={user.username}
                    online={user.online}
                  />
                  <div className='flex flex-col justify-between'>
                    <div className='text-md text-secondary-foreground'>
                      {user.username}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {t('visit_profile')}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )} */}
      </CardContent>
    </Card>
  );
}

export { FlowCard };
