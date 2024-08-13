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
import ProfileInfo from './ProfileInfo';

// Динамический импорт компонентов
const Wall = dynamic(() => import('./Wall'), { ssr: false });
const Offers = dynamic(() => import('./Offers'), { ssr: false });

const ExpandableContent = dynamic(() => import('./ProfileDetailsDynamic'), { ssr: false });


const ProfileDetailsComponent = dynamic(() => import('./clientComponent'), {
  ssr: false,
});

export async function generateMetadata({
  params,
}: {
  params: { username: string; locale: string };
}): Promise<Metadata> {
  const { locale, username } = params;

  // Получение данных профиля
  const profileDetails = await fetchProfileDetails(locale, username, null);

  return {
    title: `@${profileDetails?.username || ''}`,
    description: profileDetails?.bio || '',
    metadataBase: new URL(process.env.NEXT_PUBLIC_WEBSITE_URL || ''),
    openGraph: {
      title: `@${profileDetails?.username || ''}`,
      description: profileDetails?.bio || '',
      images: profileDetails?.gallery.map((item: any) => item.original) || [],
    },
  };
}

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

  // Определяем вкладки
  const tabs = [
    { 
      label: 'Инфо', 
      component: <ProfileInfo 
      profileDetails={profileDetails} 
      userId={userId} 
      t={t} 
      params={params} 
    /> 
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
