import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface ProfileContextType {
  avatarUrl: string | null;
  companyLogoUrl: string | null;
  updateAvatar: (url: string | null) => void;
  updateCompanyLogo: (url: string | null) => void;
}

const ProfileContext = createContext<ProfileContextType>({
  avatarUrl: null,
  companyLogoUrl: null,
  updateAvatar: () => {},
  updateCompanyLogo: () => {},
});

export const useProfile = () => useContext(ProfileContext);

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider = ({ children }: ProfileProviderProps) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    // Inicializar desde localStorage si existe
    const savedAvatar = localStorage.getItem('user_avatar');
    return savedAvatar ? savedAvatar : null;
  });
  
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(() => {
    // Inicializar desde localStorage si existe
    const savedLogo = localStorage.getItem('company_logo');
    return savedLogo ? savedLogo : null;
  });

  // Guardar en localStorage cuando cambian
  useEffect(() => {
    if (avatarUrl) {
      localStorage.setItem('user_avatar', avatarUrl);
    } else {
      localStorage.removeItem('user_avatar');
    }
  }, [avatarUrl]);

  useEffect(() => {
    if (companyLogoUrl) {
      localStorage.setItem('company_logo', companyLogoUrl);
    } else {
      localStorage.removeItem('company_logo');
    }
  }, [companyLogoUrl]);

  const updateAvatar = (url: string | null) => {
    setAvatarUrl(url);
  };

  const updateCompanyLogo = (url: string | null) => {
    setCompanyLogoUrl(url);
  };

  const value = {
    avatarUrl,
    companyLogoUrl,
    updateAvatar,
    updateCompanyLogo,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};