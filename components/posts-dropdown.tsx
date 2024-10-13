'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RiArrowDownSLine } from 'react-icons/ri';

export function PostsDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className='relative'>
      <button
        className='flex items-center rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200'
        onClick={toggleDropdown}
      >
        My Posts <RiArrowDownSLine className='ml-2' />
      </button>
      {isOpen && (
        <div className='absolute left-0 z-10 mt-2 w-48 rounded-md border bg-white py-2 shadow-lg'>
          <Link
            href='/profile/posts/all'
            className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
          >
            All Posts
          </Link>
          <Link
            href='/profile/posts/drafts'
            className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
          >
            Drafts
          </Link>
        </div>
      )}
    </div>
  );
}
