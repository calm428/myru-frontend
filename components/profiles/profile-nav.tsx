'use client';

import { Dispatch, SetStateAction, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

import { NavItem } from '@/types/nav';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { IoRemoveOutline } from 'react-icons/io5';

interface ProfileNavProps {
  items: NavItem[];
  setOpen?: Dispatch<SetStateAction<boolean>>; // Обязательное состояние
  hideSidebar: boolean;
}

export function ProfileNav({ items, setOpen, hideSidebar }: ProfileNavProps) {
  const t = useTranslations('main');
  const path = usePathname(); // Получаем текущий путь
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const stripLangPrefix = (url: string) => {
    const langPrefixes = ['/ru/', '/es/', '/ka/'];
    for (const prefix of langPrefixes) {
      if (url.startsWith(prefix)) {
        return url.replace(prefix, '/');
      }
    }
    return url;
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    handleResize(); // Проверка при монтировании компонента
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (isMobile && setOpen) {
      setOpen(false); // Закрываем мобильное меню при изменении пути
    }
    // Закрываем выпадающее меню при изменении пути на мобильных устройствах
    setOpenDropdown(null);
  }, [path, isMobile, setOpen]);

  const normalizedPath = stripLangPrefix(path ?? '');

  if (!items?.length || hideSidebar === true) {
    return null;
  }

  const handleDropdownToggle = (title: string) => {
    setOpenDropdown((prev) => (prev === title ? null : title));
  };

  const handleLinkClick = () => {
    if (isMobile && setOpen) {
      setOpen(false); // Закрываем меню для мобильных устройств
    }
  };

  return (
    <nav className='grid w-full grid-cols-4 items-start gap-2 py-2 sm:grid-cols-1'>
      {items.map((item, index) => {
        const Icon: React.ComponentType<any> | undefined = item.icon;
        const normalizedHref = stripLangPrefix(item.href ?? '');

        return (
          <div key={index} className='relative w-full'>
            {item.hasDropdown ? (
              <>
                <span
                  onClick={() => handleDropdownToggle(item.title)}
                  className={cn(
                    'text-md group flex cursor-pointer flex-col items-center justify-between rounded-md px-4 py-1 font-medium hover:bg-primary/15 sm:flex-row sm:py-3',
                    normalizedPath === normalizedHref
                      ? 'border border-primary bg-primary/10 text-primary'
                      : 'transparent'
                  )}
                >
                  <div className='md:text-md truncate text-[10px] sm:hidden sm:text-base lg:block'>
                    <span className='float-none flex items-center justify-center md:float-left'>
                      {Icon && <Icon className='size-5 lg:mr-2' />}
                    </span>
                    {t(item.title as keyof IntlMessages['main'])}
                  </div>
                  {!isMobile && (
                    <>
                      {openDropdown === item.title ? (
                        <FaChevronUp className='ml-2' />
                      ) : (
                        <FaChevronDown className='ml-2' />
                      )}
                    </>
                  )}
                </span>
                {!isMobile && openDropdown === item.title && (
                  <div className='w-full'>
                    <ul className='ml-2 mt-2'>
                      {item.dropdownItems?.map((dropdownItem, idx) => (
                        <li
                          key={idx}
                          className='flex px-4 py-6 hover:bg-gray-100 dark:hover:bg-primary'
                        >
                          <IoRemoveOutline className='mr-2' size={24} />
                          <Link
                            href={dropdownItem.href}
                            onClick={handleLinkClick}
                          >
                            {dropdownItem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {isMobile && openDropdown === item.title && (
                  <div className='absolute bottom-full left-0 z-20 mb-2 w-auto rounded-md border bg-background shadow-lg'>
                    <ul>
                      {item.dropdownItems?.map((dropdownItem, idx) => (
                        <li
                          key={idx}
                          className='px-4 py-2 hover:bg-gray-100 dark:hover:bg-primary'
                        >
                          <Link
                            href={dropdownItem.href}
                            onClick={handleLinkClick}
                          >
                            {dropdownItem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.href ? item.href : '/'}
                onClick={() => {
                  handleLinkClick();
                  if (setOpen) setOpen(false); // Закрываем мобильное меню при переходе по ссылке
                }}
                target={item.external ? '_blank' : undefined}
              >
                <span
                  className={cn(
                    'text-md group flex flex-col items-center rounded-md px-4 py-1 font-medium hover:bg-primary/15 sm:flex-row sm:py-3',
                    normalizedPath === normalizedHref
                      ? 'border border-primary bg-primary/10 text-primary'
                      : 'transparent',
                    item.disabled && 'cursor-not-allowed opacity-80'
                  )}
                >
                  {Icon && <Icon className='size-5 lg:mr-2' />}
                  <span className='md:text-md truncate text-[10px] sm:hidden sm:text-base lg:block'>
                    {t(item.title as keyof IntlMessages['main'])}
                  </span>
                </span>
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
