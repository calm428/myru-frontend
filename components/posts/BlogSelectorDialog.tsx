import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useLocale, useTranslations } from 'next-intl';

interface Blog {
  id: string;
  title: string;
}

interface BlogSelectorDialogProps {
  onSelectBlog: (blog: Blog) => void;
  onClose: () => void; // Функция для закрытия модального окна
}

const BlogSelectorDialog: React.FC<BlogSelectorDialogProps> = ({
  onSelectBlog,
  onClose,
}) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const locale = useLocale();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`/api/flows/me?language=${locale}`); // Ваш API для получения блогов
        const data = await res.json();
        setBlogs(data.data);
      } catch (error) {
        console.error('Ошибка при получении списка блогов:', error);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Выберите товар</DialogTitle>
          <DialogDescription>
            чтобы прикрепить его к вашему посту.
          </DialogDescription>
        </DialogHeader>
        <ul className='space-y-2'>
          {blogs.map((blog) => (
            <li key={blog.id} className='flex justify-between'>
              <span>{blog.title}</span>
              <button
                className='text-blue-500 hover:underline'
                onClick={() => onSelectBlog(blog)} // Передаем выбранный блог
              >
                Выбрать
              </button>
            </li>
          ))}
        </ul>
        <DialogFooter>
          <DialogClose asChild>
            <button className='mt-4 block w-full rounded-lg bg-red-500 py-2 text-white hover:bg-red-600'>
              Закрыть
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BlogSelectorDialog;
