import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface SettingsContextType {
  brandColor: string;
  setBrandColor: (color: string) => void;
  companyLogo: string | null;
  setCompanyLogo: (logo: string | null) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [brandColor, setBrandColorState] = useState<string>(() => {
    return localStorage.getItem('worksphere_brand_color') || 'blue';
  });
  const [companyLogo, setCompanyLogoState] = useState<string | null>(() => {
    return localStorage.getItem('worksphere_company_logo');
  });

  const applyThemeColor = (colorId: string) => {
    const brandColors: Record<string, string> = {
      blue: '221.2 83.2% 53.3%',
      purple: '271.5 81.3% 55.9%',
      emerald: '142.1 70.6% 45.3%',
      rose: '346.8 77.2% 49.8%',
      amber: '37.7 92.1% 50.2%',
    };
    
    const value = brandColors[colorId] || brandColors.blue;
    document.documentElement.style.setProperty('--primary', value);
    document.documentElement.style.setProperty('--ring', value);
  };

  useEffect(() => {
    applyThemeColor(brandColor);
  }, [brandColor]);

  const setBrandColor = (color: string) => {
    setBrandColorState(color);
    localStorage.setItem('worksphere_brand_color', color);
    applyThemeColor(color);
  };

  const setCompanyLogo = (logo: string | null) => {
    setCompanyLogoState(logo);
    if (logo) {
      localStorage.setItem('worksphere_company_logo', logo);
    } else {
      localStorage.removeItem('worksphere_company_logo');
    }
  };

  return (
    <SettingsContext.Provider value={{ brandColor, setBrandColor, companyLogo, setCompanyLogo }}>
      {children}
    </SettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
