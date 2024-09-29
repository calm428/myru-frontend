'use client';

import { CTASection } from '@/components/home/cta';
import FilterListSection from '@/components/home/filter-list';
import FlowSection from '@/components/home/flow';
import ProfileSection from '@/components/home/profile';
import { scrollToTransition } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TbFilterSearch } from 'react-icons/tb'; // Импорт иконки
import HeroSection from '@/components/main/heroForMain';

export default function HomePage() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<string>(
    searchParams.get('mode') || 'flow'
  );
  const [isCTAVisible, setIsCTAVisible] = useState(true);
  const [isManualToggle, setIsManualToggle] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    setViewMode(searchParams.get('mode') || 'flow');
  }, [searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      if (window === undefined) return;
      const currentScrollY =
        window.scrollY || document.documentElement.scrollTop;

      // Вводим зону комфорта в 10 пикселей
      if (Math.abs(currentScrollY - lastScrollY) < 10) {
        return;
      }

      if (currentScrollY > 1) {
        setIsScrolledDown(true);
        if (!isManualToggle) {
          setIsCTAVisible(false); // Скрыть CTASection при прокрутке вниз
        }
      } else {
        setIsScrolledDown(false);
        setIsCTAVisible(true); // Показать CTASection при прокрутке вверх
        setIsManualToggle(false); // Сбросить состояние ручного управления
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isManualToggle, lastScrollY]);

  useEffect(() => {
    const saveScrollPosition = () => {
      if (window === undefined) return;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          'home-page-scroll-position',
          (window.scrollY || document.documentElement.scrollTop).toString()
        );
      }
    };
    return () => {
      window.removeEventListener('beforeunload', saveScrollPosition);
    };
  }, []);

  useEffect(() => {
    if (window === undefined) return;

    if (typeof localStorage !== 'undefined') {
      const savedPosition = localStorage.getItem('home-page-scroll-position');
      if (savedPosition) {
        scrollToTransition(Number(savedPosition));

        localStorage.removeItem('home-page-scroll-position');
      }
    }
  }, []);

  const toggleCTAVisibility = () => {
    setIsCTAVisible(!isCTAVisible);
    setIsManualToggle(true); // Устанавливаем вручную управляемый режим
  };

  return (
    <div>
      <HeroSection />

      {(!isCTAVisible || isScrolledDown) && (
        <button
          onClick={toggleCTAVisibility}
          className={`fixed right-4 z-50 rounded-full bg-blue-500 p-4 text-white shadow-lg transition-all ${
            isCTAVisible ? 'bottom-[100px] md:bottom-4' : 'bottom-4'
          }`}
        >
          <TbFilterSearch size={12} />
        </button>
      )}
      {isCTAVisible && <CTASection />}
      <section className='container'>
        <FilterListSection />
        {viewMode === 'profile' ? (
          <ProfileSection />
        ) : viewMode === 'flow' ? (
          <FlowSection />
        ) : null}
      </section>
    </div>
  );
}
