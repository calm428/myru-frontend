'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function FavoritesPage() {
  const [currentLang, setCurrentLang] = useState<'En' | 'Ru' | 'Ka' | 'Es'>(
    'Ru'
  );

  // Получение данных с использованием SWR
  const { data, error } = useSWR('/api/fav/get', fetcher);

  if (error) return <div>Ошибка</div>;

  // Если данные еще загружаются, покажем скелетон
  if (!data) {
    return (
      <div className='container mx-auto py-6'>
        <h1 className='text-3xl font-bold'>Наиминование товаров</h1>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  const favorites = data.data;

  return (
    <div className='container mx-auto py-6'>
      <h1 className='pb-4 text-3xl font-bold'>Наиминование товаров</h1>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {favorites.map((favorite: any) => (
          <div key={favorite.ID} className='rounded-lg border p-4 shadow-lg'>
            <img
              src={`https://proxy.myru.online/100/https://img.myru.online/${favorite.Blog.photos[0].files[0].path}`}
              alt='Photo'
              className='mb-4 h-16 w-16 rounded-full'
            />
            <h2 className='text-xl font-semibold'>
              {favorite.Blog.MultilangTitle[currentLang]}
            </h2>
            <p className='text-sm text-gray-600'>
              {favorite.Blog.MultilangDescr[currentLang]}
            </p>
            <p className='mt-2 text-gray-500'>
              Просмотров: {favorite.Blog.Views} ₽
            </p>
            <p className='mt-2 text-gray-500'>Цена: {favorite.Blog.Total}</p>
            <Link
              className='mt-4 inline-block rounded bg-blue-500 px-4 py-2 text-white'
              href={`/flows/${favorite.Blog.UniqId}/${favorite.Blog.Slug}`}
            >
              Открыть товар
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// Компонент скелетона
const SkeletonCard = () => (
  <div className='animate-pulse rounded-lg border p-4 shadow-lg'>
    <div className='mb-4 h-16 w-16 rounded-full bg-gray-300'></div>
    <div className='mb-2 h-6 w-32 bg-gray-300'></div>
    <div className='mb-2 h-4 w-48 bg-gray-200'></div>
    <div className='mb-2 h-4 w-40 bg-gray-200'></div>
    <div className='h-4 w-24 bg-gray-200'></div>
    <div className='mt-4 h-8 w-32 bg-blue-300'></div>
  </div>
);
