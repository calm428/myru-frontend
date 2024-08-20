import React, { useEffect, useState, useRef, forwardRef } from 'react';
import { ControlProps, components, GroupBase } from 'react-select';
import { useSelectContext } from './selectContext';

const CustomControl = forwardRef<HTMLDivElement, ControlProps<any, boolean, GroupBase<any>> & { type: string }>(
  (props, ref) => {
    const { onOpenMobileModal } = useSelectContext();
    const [isMobile, setIsMobile] = useState(false);
    const localRef = useRef<HTMLDivElement>(null);
    const combinedRef = ref || localRef;
    const touchStartTime = useRef<number | null>(null);
    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);
    const touchMoved = useRef<boolean>(false);

    useEffect(() => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth <= 768);
      }
    }, []);

    useEffect(() => {
      const handleTouchStart = (event: TouchEvent) => {
        touchStartTime.current = Date.now();
        touchStartX.current = event.touches[0].clientX;
        touchStartY.current = event.touches[0].clientY;
        touchMoved.current = false;
      };

      const handleTouchMove = (event: TouchEvent) => {
        const deltaX = Math.abs(event.touches[0].clientX - (touchStartX.current || 0));
        const deltaY = Math.abs(event.touches[0].clientY - (touchStartY.current || 0));
        if (deltaX > 10 || deltaY > 10) {
          touchMoved.current = true;
        }
      };

      const handleTouchEnd = (event: TouchEvent) => {
        if (!touchMoved.current && touchStartTime.current && (Date.now() - touchStartTime.current < 500)) {
          handleClick(event);
        }
        touchStartTime.current = null;
        touchMoved.current = false;
      };

      if (combinedRef && 'current' in combinedRef && combinedRef.current) {
        combinedRef.current.addEventListener('touchstart', handleTouchStart, { passive: true });
        combinedRef.current.addEventListener('touchmove', handleTouchMove, { passive: true });
        combinedRef.current.addEventListener('touchend', handleTouchEnd, { passive: true });
      }

      return () => {
        if (combinedRef && 'current' in combinedRef && combinedRef.current) {
          combinedRef.current.removeEventListener('touchstart', handleTouchStart);
          combinedRef.current.removeEventListener('touchmove', handleTouchMove);
          combinedRef.current.removeEventListener('touchend', handleTouchEnd);
        }
      };
    }, [isMobile, onOpenMobileModal]);

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      handleClick(event);
    };

    const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement> | TouchEvent) => {
      if (isMobile && onOpenMobileModal) {
        onOpenMobileModal(props.type);
        event.preventDefault();
        event.stopPropagation();
      } else if ('onMouseDown' in props.innerProps && props.innerProps.onMouseDown) {
        props.innerProps.onMouseDown(event as React.MouseEvent<HTMLDivElement, MouseEvent>);
      }
    };

    return (
      <div ref={combinedRef}>
        <components.Control
          {...props}
          innerProps={{
            ...props.innerProps,
            onMouseDown: handleMouseDown,
            onTouchStart: (e) => e.stopPropagation(), // предотвращаем всплытие touchstart
            onTouchMove: (e) => e.stopPropagation(), // предотвращаем всплытие touchmove
            onTouchEnd: (e) => e.stopPropagation(), // предотвращаем всплытие touchend
          }}
        >
          {props.children}
        </components.Control>
      </div>
    );
  }
);

export default CustomControl;
