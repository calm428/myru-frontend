import dynamic from 'next/dynamic';
import Tabs from './tabs'; // Импорт компонента Tabs
import { fetchProfileDetails } from './fetchProfileDetails'; // Импорт функции для загрузки данных
import { headers } from 'next/headers';
import cookie from 'cookie';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { BiSolidCalendar, BiSolidCategory } from 'react-icons/bi';
import { FaExclamation, FaTelegramPlane, FaThumbsUp } from 'react-icons/fa';
import axios from 'axios';
import {
  MdOutlineHouseSiding,
  MdOutlineKeyboardArrowRight,
  MdOutlinePostAdd,
  MdPhoneInTalk,
} from 'react-icons/md';
import { RiUserFollowFill } from 'react-icons/ri';
import { TbPhotoX } from 'react-icons/tb';
import { getServerSession } from 'next-auth';
import { VscEye } from 'react-icons/vsc';
import QRCode from 'react-qr-code';
import { QRCodeModal } from '@/components/common/qrcode-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Metadata, ResolvingMetadata } from 'next';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LiaSmsSolid } from 'react-icons/lia';
import { ReportModal } from '@/components/common/report-modal';
import BackButton from '@/components/home/back-button';
import { FollowButtonGroup } from '@/components/home/profile/follow-button-group';
import { ProfileImageGallery } from '@/components/home/profile/profile-image-gallery';
import authOptions from '@/lib/authOptions';
import '@/styles/editor.css';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import MessageForm from '@/components/home/messsage-form';
import getRoomId from '@/lib/server/chat/getRoomId';
import { IoLanguage } from 'react-icons/io5';
import CallModal from '@/components/common/call-modal';
import { CiStreamOff } from 'react-icons/ci';
import { CiStreamOn } from 'react-icons/ci';
// Динамический импорт компонентов
const Wall = dynamic(() => import('./Wall'), { ssr: false });
const Offers = dynamic(() => import('./Offers'), { ssr: false });

const ExpandableContent = dynamic(() => import('./ProfileDetailsDynamic'), { ssr: false });


const ProfileDetailsComponent = dynamic(() => import('./clientComponent'), {
  ssr: false,
});


export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: { username: string; locale: string };
  searchParams: { [key: string]: string | undefined | null };
}) {
  const { locale, username } = params;
  const activeTab = searchParams.tab || 'Инфо';
  const session = await getServerSession(authOptions);
  const headersList = headers();
  const cookiesHeader = headersList.get('cookie');
  const cookiesParsed = cookiesHeader ? cookie.parse(cookiesHeader) : {};
  const userIdCookie = cookiesParsed['UserID'];
  const userId = session?.user?.id || userIdCookie || null;
  const t = await getTranslations('main');
  // Получаем данные профиля на сервере
  const profileDetails = await fetchProfileDetails(locale, username, userId);


  if (!profileDetails) {
    return <div>Failed to load profile. Please try again later.</div>;
  }

  // Передаем данные в компонент ProfileInfo
  const ProfileInfo = () => (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-4'>
      <div className=''>
        <div className='w-full'>
          <div className='absolute z-10'>
            {profileDetails.streaming && profileDetails.streaming.length > 0 ? (
              <div className='streaming-list'>
                {profileDetails.streaming.map((stream: any, index: any) => (
                  <Link href={`/stream/${stream.roomID}`} key={index} className='stream-item'>
                    <div className='flex items-center justify-end rou bg-red-500 px-2 text-white'>
                      <CiStreamOn className='mr-2' />
                      <span>В эфире</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className='flex items-center justify-end  bg-black/50 px-2 text-white'>
                <CiStreamOff className='mr-2' />
                <span className=''>Вне эфира</span>
              </div>
            )}
          </div>
          {profileDetails.gallery?.length > 0 ? (
            <ProfileImageGallery images={profileDetails.gallery} />
          ) : (
            <TbPhotoX className='size-full' />
          )}
        </div>
        <div className='my-4 flex gap-3'>
          <ReportModal>
            <Button variant='outline' className='rounded-full' size='icon'>
              <FaExclamation className='size-4' />
            </Button>
          </ReportModal>
          {profileDetails.telegram && (
            <Button
              variant='outline'
              className='rounded-full'
              size='icon'
              asChild
            >
              <Link
                href={`tg://resolve?domain=${profileDetails.telegram}`}
                target='_blank'
              >
                <FaTelegramPlane className='size-5' />
              </Link>
            </Button>
          )}
          {userId ? (
            !profileDetails.me && (
              <CallModal
                callee={{
                  username: profileDetails.username || '',
                  avatar: profileDetails.gallery?.[0]?.original || '',
                  id: profileDetails.id || '',
                  session: profileDetails.session
                }}
              >
                <Button variant='outline' className='rounded-full' size='icon'>
                  <MdPhoneInTalk className='size-5' />
                </Button>
              </CallModal>
            )
          ) : (
            <Button
              variant='outline'
              className='rounded-full'
              size='icon'
              asChild
            >
              <Link
                href={`/auth/signin?callbackUrl=/profiles/${params.username}`}
              >
                <MdPhoneInTalk className='size-5' />
              </Link>
            </Button>
          )}
          {userId ? (
            !profileDetails.me &&
            <MessageForm
              user={{
                username: profileDetails.username,
                userId: profileDetails.id,
                bot: profileDetails.bot,
              }}
            >
              <Button variant='outline' className='rounded-full' size='icon'>
                <LiaSmsSolid className='size-4' />
              </Button>
            </MessageForm>
          ) : (
            <Button
              variant='outline'
              className='rounded-full'
              size='icon'
              asChild
            >
              <Link
                href={`/auth/signin?callbackUrl=/profiles/${params.username}`}
              >
                <LiaSmsSolid className='size-4' />
              </Link>
            </Button>
          )}
          <FollowButtonGroup
            me={profileDetails.me}
            follow={profileDetails.follow}
            followerID={profileDetails.id}
          />
        </div>
        <div className='hidden md:block'>
          <div className='text-lg font-semibold'>{t('post_feed')}: </div>
          {profileDetails.latestblog && (
            <Card className='w-full'>
              <CardHeader>
                <div className='flex justify-end'>
                  <Badge
                    variant='outline'
                    className='m-0  bg-black/20 text-xs text-white'
                  >
                    <FaThumbsUp className='mr-2 size-3' />
                    {profileDetails.latestblog.review.votes}
                  </Badge>
                </div>
                <div className='flex justify-center'>
                  <Image
                    src={profileDetails.latestblog.hero}
                    alt='preview image'
                    width={100}
                    height={100}
                    className='rounded-full'
                  />
                </div>
                <div className='flex items-center justify-center gap-2'>
                  <CardTitle className='line-clamp-1 text-center '>
                    {profileDetails.latestblog.title}
                  </CardTitle>
                </div>
                <CardDescription className='text-center'>
                  {profileDetails.latestblog.subtitle}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className='btn btn--wide w-full !rounded-md' asChild>
                  <Link
                    href={`/flows/${profileDetails.latestblog.link}`}
                    className='text-center'
                  >
                    {t('view_post')}
                    <MdOutlineKeyboardArrowRight className='ml-2 size-5' />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )}
          <Button
            variant='outline'
            className='mt-3 w-full rounded-md !border-blue-600 text-primary'
            asChild
          >
            <Link href={`/home?mode=flow`}>
              <VscEye className='mr-2 size-5' />
              {t('view_more_topics')}
            </Link>
          </Button>
        </div>
      </div>

      <div className='md:col-span-2 xl:col-span-3'>
        <div className='grid grid-cols-1'>
          <div className='col-span-4 w-full'>
            <div className=''>
              <div className='flex gap-3 pb-2 text-xl font-semibold text-secondary-foreground'>
                @{profileDetails.username}
              </div>
              <div className='pb-2 text-sm text-muted-foreground'>
                {profileDetails.bio}
              </div>
            </div>
          </div>
          <div className='hidden items-start justify-end'>
            <div>
              место для вашей рекламы,{' '}
              <span className='text-green-500 underline'>подбробнее</span>
            </div>
            <QRCodeModal
              qrcode={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/profiles/${profileDetails.username}`}
            >
              <QRCode
                value={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/profiles/${profileDetails.username}`}
                className='mb-4 size-[50px] min-w-[50px] cursor-pointer'
              />
            </QRCodeModal>
          </div>
        </div>
        <Separator />
        <div className='my-3 flex flex-row'>
          <ExpandableContent>
          <div style={{ width: '-webkit-fill-available' }}>
            <div className='flex items-center gap-2'>
              <MdOutlineHouseSiding className='pb0-8 size-5' />
              {t('city')}
            </div>
            <div className='flex flex-wrap gap-2'>
              {profileDetails.cities.map((city: string, index: number) => (
                <Link href={`/home?mode=profile&city=${city}`} key={index}>
                  <Badge
                    variant='outline'
                    className='mb-2 max-w-fit rounded-full bg-primary/10 p-2 px-4 text-primary hover:border-primary'
                  >
                    <p>{city}</p>
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
          </ExpandableContent>

          <ExpandableContent>
          <div style={{ width: '-webkit-fill-available' }}>
            <div className='flex items-center gap-2'>
              <BiSolidCategory className='size-4' />
              {t('category')}
            </div>
            <div className='flex flex-wrap gap-2'>
              {profileDetails.categories.map(
                (category: string, index: number) => (
                  <Link
                    href={`/home?mode=profile&city=${category}`}
                    key={index}
                  >
                    <Badge
                      variant='outline'
                      className='max-w-fit rounded-full bg-primary/10 p-2 px-4 text-primary hover:border-primary'
                    >
                      {category}
                    </Badge>
                  </Link>
                )
              )}
            </div>
          </div>
          </ExpandableContent>

        </div>
        <Separator />
        <div className='my-3 flex flex-col gap-4 md:flex-row md:gap-24'>
          <div>
            <div className='flex items-center gap-2 pb-2'>
              <BiSolidCalendar className='size-4' />
              {t('online_status')}
            </div>
            <div className='text-sm text-muted-foreground'>
              <div>
                {t('this_month')}: {profileDetails.review.monthtime.hour}h{' '}
                {profileDetails.review.monthtime.minutes}m
              </div>
              <div>
                {t('total')}: {profileDetails.review.totaltime.hour}h{' '}
                {profileDetails.review.totaltime.minutes}m
              </div>
            </div>
          </div>
          <div>
            <div className='flex items-center gap-2 pb-2'>
              <MdOutlinePostAdd className='size-4' />
              {t('publications')}
            </div>
            <div className='text-sm text-muted-foreground'>
              <div>
                {t('this_month')}: {profileDetails.review.monthposts}
              </div>
              <div>
                {t('total')}: {profileDetails.review.totalposts}
              </div>
            </div>
          </div>
          <div>
            <div className='flex items-center gap-2 pb-2'>
              <RiUserFollowFill className='size-4' />
              {t('followers')}
            </div>
            <div className='text-sm text-muted-foreground'>
              <div>
                {t('total')}: {profileDetails.review.followers}
              </div>
            </div>
          </div>
        </div>
        <div className='space-y-3'>
        {profileDetails.additionalinfo && (
            <div>
              <div className='pb-2 text-lg font-semibold'>
                {t('additional_info')}
              </div>
              <ProfileDetailsComponent profileDetails={profileDetails} />
            </div>
        )}
        </div>

        <div className='mx-auto max-w-sm md:hidden'>
          <div className='pb-2 text-lg font-semibold'>{t('post_feed')}: </div>
          {profileDetails.latestblog && (
            <Card className='w-full'>
              <CardHeader>
                <div className='flex justify-end'>
                  <Badge
                    variant='outline'
                    className='m-0  bg-black/20 text-xs text-white'
                  >
                    <FaThumbsUp className='mr-2 size-3' />
                    {profileDetails.latestblog.review.votes}
                  </Badge>
                </div>
                <div className='flex justify-center'>
                  <Image
                    src={profileDetails.latestblog.hero}
                    alt='preview image'
                    width={100}
                    height={100}
                    className='rounded-full'
                  />
                </div>
                <div className='flex items-center justify-center gap-2'>
                  <CardTitle>{profileDetails.latestblog.title}</CardTitle>
                </div>
                <CardDescription className='text-center'>
                  {profileDetails.latestblog.subtitle}
                </CardDescription>
              </CardHeader>
              <CardFooter className='flex justify-center'>
                <Link href={`/flows/${profileDetails.latestblog.link}`}>
                  <Button className='btn btn--wide !rounded-md !text-center'>
                    {t('view_post')}
                    <MdOutlineKeyboardArrowRight className='ml-2 size-5' />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          )}
          <Link href={`/home?mode=flow`}>
            <Button
              variant='outline'
              className='mt-3 w-full rounded-md !border-blue-600 text-primary'
            >
              <VscEye className='mr-2 size-5' />
              {t('view_more_topics')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );

  // Определяем вкладки
  const tabs = [
    { 
      label: 'Инфо', 
      component: <ProfileInfo /> 
    },
    { 
      label: 'Лента', 
      component: <Wall />
    },
    { 
      label: 'Предложения', 
      component: <Offers />
    },
  ];

  return (
    <section className='container py-4'>
      <div className='pb-4'>
      <BackButton callback={searchParams['callback']} />
      </div>
      <div className='flex'>
        <div className='md:col-span-2 xl:col-span-3'>
          <Tabs tabs={tabs} activeTab={activeTab} />
        </div>
      </div>
    </section>
  );
}
