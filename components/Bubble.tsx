
import React from 'react';

interface BubbleProps {
  role: 'user' | 'model';
  text: string;
}

const Bubble: React.FC<BubbleProps> = ({ role, text }) => {
  const isUser = role === 'user';
  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-lg leading-relaxed ${
          isUser
            ? 'bg-green-500 text-white rounded-tr-none'
            : 'bg-white text-gray-800 border-2 border-green-200 rounded-tl-none'
        }`}
      >
        <p className="whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
};

export default Bubble;
