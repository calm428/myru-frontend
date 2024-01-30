import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';

interface SectionBadgeProps {
  children: React.ReactNode;
}

function SectionBadge({ children }: SectionBadgeProps) {
  return (
    <Badge
      variant='outline'
      className='border-gradient mb-[12px] rounded-full p-[13px] dark:border-none max-w-fit	'
    >
      <Icons.star className='mr-2 size-5' />
      {children}
    </Badge>
  );
}

export { SectionBadge };
