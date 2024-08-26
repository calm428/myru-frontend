import React, { useState, ReactNode } from 'react';

interface LongTextProps {
  text: ReactNode[];
  maxLength?: number;
}

const LongText: React.FC<LongTextProps> = ({ text, maxLength = 100 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  // Подсчитываем общую длину текста
  let totalLength = 0;
  let shortText = [];

  for (let i = 0; i < text.length; i++) {
    const item = text[i];
    const itemLength = typeof item === 'string' ? item.length : 0;
    totalLength += itemLength;

    if (totalLength <= maxLength) {
      shortText.push(item);
    } else {
      const remainingLength = maxLength - (totalLength - itemLength);
      if (remainingLength > 0 && typeof item === 'string') {
        shortText.push(item.slice(0, remainingLength));
      }
      break;
    }
  }

  return (
    <div>
      <p>
        {isExpanded ? text : shortText}
        {!isExpanded && totalLength > maxLength && '...'}
      </p>
      {totalLength > maxLength && (
        <button
          onClick={toggleExpansion}
          className='mt-2 text-blue-500 hover:underline'
        >
          {isExpanded ? 'Скрыть' : 'Подробнее'}
        </button>
      )}
    </div>
  );
};

export default LongText;
