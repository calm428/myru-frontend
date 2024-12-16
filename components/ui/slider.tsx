import React from 'react';

interface SliderProps {
  value: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 1,
  max = 100,
  step = 1,
}) => {
  return (
    <input
      type='range'
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      step={step}
      className='slider'
    />
  );
};
