import React, { useEffect, useState, useRef, forwardRef } from 'react';
import { ControlProps, components, GroupBase } from 'react-select';
import { useSelectContext } from './selectContext';

const CustomControl = forwardRef<HTMLDivElement, ControlProps<any, boolean, GroupBase<any>> & { type: string }>(
  (props, ref) => {
    const { onOpenMobileModal } = useSelectContext();
    const [isMobile, setIsMobile] = useState(false);
    const localRef = useRef<HTMLDivElement>(null);
    const combinedRef = ref || localRef;

    useEffect(() => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth <= 768);
      }
    }, []);

    useEffect(() => {
      const handleTouchStart = (event: TouchEvent) => {
        handleClick(event);
      };

      if (combinedRef && 'current' in combinedRef && combinedRef.current) {
        combinedRef.current.addEventListener('touchstart', handleTouchStart, { passive: false });
      }

      return () => {
        if (combinedRef && 'current' in combinedRef && combinedRef.current) {
          combinedRef.current.removeEventListener('touchstart', handleTouchStart);
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
            onTouchStart: handleClick, // Обработка touch событий
          }}
        >
          {props.children}
        </components.Control>
      </div>
    );
  }
);

export default CustomControl;
