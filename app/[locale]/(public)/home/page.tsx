'use client';

import { CTASection } from '@/components/home/cta';
import FilterListSection from '@/components/home/filter-list';
import FlowSection from '@/components/home/flow';
import ProfileSection from '@/components/home/profile';
import { scrollToTransition } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TbFilterSearch } from "react-icons/tb"; // Импорт иконки

export default function HomePage() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<string>(
    searchParams.get('mode') || 'flow'
  );
  const [isCTAVisible, setIsCTAVisible] = useState(true);
  const [isManualToggle, setIsManualToggle] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);

  useEffect(() => {
    setViewMode(searchParams.get('mode') || 'flow');
  }, [searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      if (window === undefined) return;
      const currentScrollY = window.scrollY || document.documentElement.scrollTop;

      if (currentScrollY > 100) {
        setIsScrolledDown(true);
        if (!isManualToggle) {
          setIsCTAVisible(false); // Скрыть CTASection при прокрутке вниз
        }
      } else {
        setIsScrolledDown(false);
        if (!isManualToggle) {
          setIsCTAVisible(true); // Показать CTASection при прокрутке вверх
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isManualToggle]);

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
      {(!isCTAVisible || isScrolledDown) && (
        <button
          onClick={toggleCTAVisibility}
          className={`fixed right-4 z-50 rounded-full bg-blue-500 text-white p-4 shadow-lg transition-all ${
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
