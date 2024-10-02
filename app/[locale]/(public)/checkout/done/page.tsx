'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CheckoutDonePage() {
  return (
    <div className='container mx-auto my-10'>
      <h1 className='mb-6 text-2xl font-bold'>Ваш заказ успешно оформлен!</h1>
      <p className='mb-4 text-lg'>
        Спасибо за покупку! Мы свяжемся с вами для подтверждения заказа и
        доставки.
      </p>

      <div className='flex flex-col gap-4'>
        <Link href='/'>
          <Button className='!w-full'>На главную</Button>
        </Link>
        {/* <Link href='/profile/orders'>
          <Button className='!w-full' variant='secondary'>
            Мои заказы
          </Button>
        </Link> */}
      </div>
    </div>
  );
}
