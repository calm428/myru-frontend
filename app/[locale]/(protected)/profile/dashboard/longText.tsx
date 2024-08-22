import React, { useState } from 'react';

interface LongTextProps {
    text: string;
    maxLength?: number;
}

const LongText: React.FC<LongTextProps> = ({ text, maxLength = 100 }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpansion = () => {
        setIsExpanded(!isExpanded);
    };

    const shortText = text.slice(0, maxLength);

    return (
        <div>
            <p>
                {isExpanded ? text : `${shortText}${text.length > maxLength ? '...' : ''}`}
            </p>
            {text.length > maxLength && (
                <button
                    onClick={toggleExpansion}
                    className="text-blue-500 hover:underline mt-2"
                >
                    {isExpanded ? 'Скрыть' : 'Подробнее'}
                </button>
            )}
        </div>
    );
};

export default LongText;
