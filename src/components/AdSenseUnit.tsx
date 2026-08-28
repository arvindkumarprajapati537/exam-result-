import React, { useEffect, useRef } from 'react';

interface AdSenseUnitProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  className?: string;
  label?: string;
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export const AdSenseUnit: React.FC<AdSenseUnitProps> = ({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
  label = 'Advertisement',
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const isPushedRef = useRef(false);

  // Check if current page is admin
  const isCurrentAdminPage =
    typeof window !== 'undefined' &&
    (window.location.pathname.startsWith('/admin') ||
      window.location.pathname.includes('/admin/'));

  useEffect(() => {
    // Never run on admin pages
    if (isCurrentAdminPage) return;

    if (!isPushedRef.current && adRef.current) {
      try {
        // Safe trigger of Google AdSense
        if (typeof window !== 'undefined') {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          isPushedRef.current = true;
        }
      } catch (e) {
        // Suppress AdSense initialization warnings if ads are not yet live or adblocker is active
        console.debug('AdSense unit init notice:', e);
      }
    }
  }, [isCurrentAdminPage]);

  // Strict check: Never render AdSense containers inside Admin pages
  if (isCurrentAdminPage) {
    return null;
  }

  return (
    <div
      className={`w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 my-3 sm:my-5 ${className}`}
      aria-label={label}
    >
      <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-2 sm:p-3 overflow-hidden text-center transition-all">
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 select-none">
          {label}
        </div>
        <div ref={adRef} className="w-full overflow-hidden min-h-[60px] sm:min-h-[90px] flex items-center justify-center">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', minHeight: '60px' }}
            data-ad-client="ca-pub-7771376474449956"
            data-ad-slot={slot || '1234567890'}
            data-ad-format={format}
            data-full-width-responsive={responsive ? 'true' : 'false'}
          />
        </div>
      </div>
    </div>
  );
};
