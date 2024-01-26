'use client';

import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import useSWR from 'swr';

import { PaxContext } from '@/context/context';
import { ProfileCard } from './profile-card';
import { ProfileCardSkeleton } from './profile-card-skeleton';
import { useSearchParams } from 'next/navigation';

interface ProfileData {
  username: string;
  bio: string;
  avatar: string;
  tags: string[];
  cities: string[];
  categories: string[];
  qrcode: string;
  countrycode: string;
  review: {
    totaltime: {
      hour: number;
      minutes: number;
      seconds: number;
    };
    monthtime: {
      hour: number;
      minutes: number;
      seconds: number;
    };
    totalposts: number;
  };
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function ProfileSection() {
  const searchParams = useSearchParams();
  const [profileData, setProfileData] = useState<ProfileData[]>([]);
  const [fetchURL, setFetchURL] = useState('/api/profiles/get?language=en');
  const { locale, setLocale } = useContext(PaxContext);

  const { data: fetchedData, error } = useSWR(fetchURL, fetcher);

  useEffect(() => {
    const generateFetchURL = () => {
      let baseURL = `/api/profiles/get?language=${locale}`;
      const queryParams = ['title', 'city', 'category', 'hashtag'];

      queryParams.forEach((param) => {
        const value = searchParams.get(param);
        if (value) {
          baseURL += `&${param}=${value}`;
        }
      });

      return baseURL;
    };

    setFetchURL(generateFetchURL());
  }, [searchParams, locale]);

  useEffect(() => {
    if (!error && fetchedData) {
      setProfileData(fetchedData);
    }
  }, [fetchedData, error]);

  return (
    <div className='w-full space-y-6'>
      <div className='grid w-full place-items-center gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'>
        {!error ? (
          fetchedData && profileData ? (
            profileData.map((profile: ProfileData) => (
              <ProfileCard key={profile.username} {...profile} />
            ))
          ) : (
            <>
              <ProfileCardSkeleton />
              <ProfileCardSkeleton className='hidden md:block' />
              <ProfileCardSkeleton className='hidden lg:block' />
              <ProfileCardSkeleton className='hidden 2xl:block' />
            </>
          )
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
