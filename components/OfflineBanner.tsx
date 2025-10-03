import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';

const OfflineBanner: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-yellow-500 text-center py-2 text-white font-semibold text-sm w-full z-50">
      {t('offline')}
    </div>
  );
};

export default OfflineBanner;
