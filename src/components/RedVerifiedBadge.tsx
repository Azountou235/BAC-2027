import React from 'react';

interface RedVerifiedBadgeProps {
  className?: string;
  size?: number;
}

export const RedVerifiedBadge: React.FC<RedVerifiedBadgeProps> = ({ className = '', size = 16 }) => {
  return (
    <span 
      className={`inline-flex items-center justify-center flex-shrink-0 ${className}`} 
      title="Compte Officiel Certifié"
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm"
      >
        {/* Scalloped Facebook/Meta style verified seal */}
        <path
          d="M12 1L14.7 3.2L18.1 2.8L19.4 6L22.6 7.4L22.2 10.8L24 13.5L22.2 16.2L22.6 19.6L19.4 21L18.1 24.2L14.7 23.8L12 26L9.3 23.8L5.9 24.2L4.6 21L1.4 19.6L1.8 16.2L0 13.5L1.8 10.8L1.4 7.4L4.6 6L5.9 2.8L9.3 3.2L12 1Z"
          fill="#E53935"
          transform="scale(0.85) translate(2, 2)"
        />
        {/* Crisp White Checkmark */}
        <path
          d="M9.5 13.7L7.2 11.4L5.8 12.8L9.5 16.5L17.2 8.8L15.8 7.4L9.5 13.7Z"
          fill="white"
        />
      </svg>
    </span>
  );
};
