'use client';

import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { addToCart, selectCartItems } from '@/store/cartSlice';

interface CartButtonProps {
  id: string | number;
  title: string;
  price: number;
  quantity: number;
  image: string;
  seller: string;
}

const CartButton = ({ id, title, price, image, seller }: CartButtonProps) => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems); // Получаем товары из корзины

  // Проверяем, есть ли товар уже в корзине
  const isInCart = cartItems.some((item) => item.id === id.toString());

  const handleAddToCart = () => {
    if (!isInCart) {
      dispatch(
        addToCart({
          id: id.toString(),
          title,
          price,
          quantity: 1,
          image,
          seller,
        })
      );
    }
  };

  return (
    <Button onClick={handleAddToCart} className='w-full' disabled={isInCart}>
      {isInCart ? 'Уже в корзине' : 'Добавить в корзину'}
    </Button>
  );
};

export default CartButton;
