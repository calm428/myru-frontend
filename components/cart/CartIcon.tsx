'use client';

import { useSelector } from 'react-redux';
import { selectCartItems } from '@/store/cartSlice';
import Link from 'next/link';
import { CiShoppingCart } from 'react-icons/ci';

export default function CartIcon() {
  const cartItems = useSelector(selectCartItems); // Получаем товары из корзины

  //   if (cartItems.length === 0) {
  //     return null; // Не отображаем иконку, если корзина пуста
  //   }

  return (
    <Link href='/cart' className='relative'>
      <CiShoppingCart size={24} />
      <span className='absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white'>
        {cartItems.length}
      </span>
    </Link>
  );
}
