import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  footer,
  actions,
  noPadding = false
}) => {
  return (
    <div className={`overflow-hidden rounded-lg bg-white shadow ${className}`}>
      {(title || subtitle || actions) && (
        <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              {title && <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>}
              {subtitle && <p className="mt-1 max-w-2xl text-sm text-gray-500">{subtitle}</p>}
            </div>
            {actions && <div>{actions}</div>}
          </div>
        </div>
      )}
      
      <div className={noPadding ? '' : 'px-4 py-5 sm:p-6'}>
        {children}
      </div>
      
      {footer && (
        <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;