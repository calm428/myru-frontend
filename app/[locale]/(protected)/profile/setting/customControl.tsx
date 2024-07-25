import React from 'react';
import { ControlProps, components, GroupBase } from 'react-select';
import { useSelectContext } from './selectContext';

const CustomControl = (props: ControlProps<any, boolean, GroupBase<any>>) => {
  const { onOpenMobileModal } = useSelectContext();
  const isMobile = window.innerWidth <= 768;

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    handleClick(event);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    handleClick(event);
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>) => {
    if (isMobile && onOpenMobileModal) {
      onOpenMobileModal();
      event.preventDefault();
      event.stopPropagation();
    } else if ('onMouseDown' in props.innerProps && props.innerProps.onMouseDown) {
      props.innerProps.onMouseDown(event as React.MouseEvent<HTMLDivElement, MouseEvent>);
    }
  };

  return (
    <components.Control
      {...props}
      innerProps={{
        ...props.innerProps,
        onMouseDown: handleMouseDown,
        onTouchStart: handleTouchStart,
      }}
    >
      {props.children}
    </components.Control>
  );
};

export default CustomControl;
