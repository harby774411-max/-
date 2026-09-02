import React from 'react';
import { cn } from '../lib/utils';
import { useSettings } from '../lib/useSettings';

interface WedLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'blue' | 'white' | 'slate' | 'default' | 'burgundy' | 'gold';
  showSubtitle?: boolean;
  className?: string;
}

export const WedLogo: React.FC<WedLogoProps> = ({
  size = 'md',
  variant = 'default',
  showSubtitle = true,
  className
}) => {
  const { settings } = useSettings();
  const [imageError, setImageError] = React.useState(false);

  const customLogoUrl = settings?.logo_url;
  const storeNameAr = settings?.store_name || 'ود';
  const storeSlogan = settings?.store_slogan || 'للعناية بالبشرة';

  // Automatically reset image error state whenever logo URL is updated
  React.useEffect(() => {
    setImageError(false);
  }, [customLogoUrl]);

  const sizeMap = {
    xs: { icon: 'w-6 h-6', text: 'text-lg', sub: 'text-[9px]', gap: 'gap-1.5' },
    sm: { icon: 'w-8 h-8', text: 'text-xl', sub: 'text-[10px]', gap: 'gap-2' },
    md: { icon: 'w-10 h-10', text: 'text-2xl', sub: 'text-[11px]', gap: 'gap-2.5' },
    lg: { icon: 'w-14 h-14', text: 'text-3xl', sub: 'text-xs', gap: 'gap-3' },
    xl: { icon: 'w-20 h-20', text: 'text-5xl', sub: 'text-sm', gap: 'gap-4' }
  };

  const isWhite = variant === 'white';
  const isBlue = variant === 'blue';
  const isBurgundy = variant === 'burgundy';
  const isGold = variant === 'gold';

  const primaryColor = isWhite ? '#FFFFFF' : isGold ? '#DFCEB5' : isBurgundy ? '#722F37' : isBlue ? '#93B5C6' : '#233446';
  const accentColor = isWhite ? '#E4D8DC' : isGold ? '#C5A880' : isBurgundy ? '#C5A880' : isBlue ? '#C9CCD5' : '#93B5C6';
  const textColor = isWhite ? 'text-white' : isGold ? 'text-[#FAF6F0]' : isBurgundy ? 'text-[#722F37]' : isBlue ? 'text-brand-blue' : 'text-brand-text';
  const subColor = isWhite ? 'text-[#E4D8DC]' : isGold ? 'text-[#C5A880]' : isBurgundy ? 'text-[#8B3A44]' : isBlue ? 'text-brand-blue/80' : 'text-brand-text-muted';

  return (
    <div className={cn("inline-flex items-center select-none", sizeMap[size].gap, className)}>
      {/* WD Monogram SVG or Custom Uploaded Logo */}
      <div className={cn("relative flex-shrink-0 flex items-center justify-center overflow-hidden rounded-full", sizeMap[size].icon)}>
        {customLogoUrl && !imageError ? (
          <img 
            src={customLogoUrl} 
            alt={storeNameAr} 
            className="w-full h-full object-cover rounded-full shadow-xs"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-xs"
          >
            {/* Soft Outer Circle */}
            <circle
              cx="50"
              cy="50"
              r="46"
              stroke={accentColor}
              strokeWidth="1.5"
              strokeDasharray="4 2"
              opacity="0.7"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke={primaryColor}
              strokeWidth="1"
              opacity="0.3"
            />

            {/* Letter W */}
            <path
              d="M24 32 L34 68 L42 42 L50 68 L60 32"
              stroke={primaryColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Letter D */}
            <path
              d="M48 32 H62 C74 32 78 40 78 50 C78 60 74 68 62 68 H48"
              stroke={accentColor}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Small accent dot */}
            <circle cx="50" cy="24" r="2.5" fill={accentColor} />
          </svg>
        )}
      </div>

      {/* Typography */}
      <div className="flex flex-col text-right">
        <span className={cn("arabic-text font-black tracking-tight leading-none", sizeMap[size].text, textColor)}>
          {storeNameAr}
        </span>
        {showSubtitle && (
          <span className={cn("arabic-text font-medium leading-tight mt-1 whitespace-nowrap", sizeMap[size].sub, subColor)}>
            {storeSlogan}
          </span>
        )}
      </div>
    </div>
  );
};
