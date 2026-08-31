import React, { createContext, useContext, useState, useEffect } from 'react';
import { OccasionTheme, OccasionThemeId } from '../types';

export const THEMES: Record<OccasionThemeId, OccasionTheme> = {
  default: {
    id: 'default',
    name: 'Royal Heritage Gold & Emerald',
    subtitle: 'Classic Tanishq-inspired regal aesthetic for year-round luxury',
    badge: 'Royal Heritage',
    iconName: 'crown',
    primaryColor: '#081816',
    primaryDark: '#040d0c',
    accentGold: '#DFB76C',
    accentGoldDark: '#C59B27',
    bgWarm: '#FAF7F2',
    bgSurface: '#F3EEE6',
    heroTagline: 'THE MAJESTIC HEIRLOOM COLLECTION',
    heroHeadline: 'Timeless Grandeur in 22K Hallmarked Gold & Solitaires',
    announcementText: '✨ DHANLAXMI JWELLERS • 100% BIS Hallmarked 916 Gold • Haldwani Nanda Vihar Showroom • Call 7668037278 for VIP Trials',
    festiveDiscountNote: 'Flat 25% OFF on Making Charges on Select Bridal Sets',
    accentBorder: '#C59B27',
    particleType: 'none',
  },
  diwali: {
    id: 'diwali',
    name: 'Shubh Deepavali Mahotsav',
    subtitle: 'Auspicious deep crimson, radiant golden diyas & festive celebration',
    badge: 'Diwali Special Mahotsav',
    iconName: 'flame',
    primaryColor: '#22080D',
    primaryDark: '#140407',
    accentGold: '#FBBF24',
    accentGoldDark: '#D97706',
    bgWarm: '#FCF9F2',
    bgSurface: '#FDF2E9',
    heroTagline: 'SHUBH DEEPAVALI AUSPICIOUS JEWELS',
    heroHeadline: 'Illuminate Your Festivities with Pure 24K & 22K Gold',
    announcementText: '🪔 Shubh Deepavali Mahotsav • Special 25% OFF on Making Charges & 0% Making on Diamond Sets! Haldwani Store Open All 7 Days',
    festiveDiscountNote: 'Festive Laxmi Pujan Gold Coins Available in Tamper-Proof Certicards',
    accentBorder: '#F59E0B',
    particleType: 'diya',
  },
  holi: {
    id: 'holi',
    name: 'Holi Royal Radiance & Utsav',
    subtitle: 'Vibrant Gulal crimson, imperial violet accents & festive sterling artefacts',
    badge: 'Holi Utsav Exclusive',
    iconName: 'sparkles',
    primaryColor: '#1A0B2E',
    primaryDark: '#0F051D',
    accentGold: '#F43F5E',
    accentGoldDark: '#E11D48',
    bgWarm: '#FDF8F6',
    bgSurface: '#FCE7F3',
    heroTagline: 'RANG BARSE ROYAL JEWELRY UTSAV',
    heroHeadline: 'Dazzling Colors in Handcrafted Polki, Jadau & 925 Silver',
    announcementText: '🎨 Rang Barse Festive Celebration • Explore Pure 925 Silver Pooja Thali Sets & Lightweight Floral Gold Jewelry',
    festiveDiscountNote: 'Special Holi Gift Hampers with Every In-Store Bridal Consultation',
    accentBorder: '#EC4899',
    particleType: 'gulal',
  },
  'akshaya-tritiya': {
    id: 'akshaya-tritiya',
    name: 'Akshaya Tritiya & Shubh Dhanteras',
    subtitle: 'Pure bullion gold, sacred kalash motifs & eternal prosperity blessing',
    badge: 'Akshaya Tritiya Prosperity',
    iconName: 'coins',
    primaryColor: '#1E1205',
    primaryDark: '#120A03',
    accentGold: '#EAB308',
    accentGoldDark: '#CA8A04',
    bgWarm: '#FEFDF5',
    bgSurface: '#FEF3C7',
    heroTagline: 'AUSPICIOUS WEALTH & DHANTERAS BLESSINGS',
    heroHeadline: 'Multiply Your Fortune with 24K Minted Coins & Heirlooms',
    announcementText: '🪙 Shubh Akshaya Tritiya & Dhanteras • Lock Today’s Gold Rate with ₹1000 Token Booking • 100% BIS 916 Certified',
    festiveDiscountNote: 'Zero Making Charges on Pure 24K Gold Bars & Laxmi Silver Coins',
    accentBorder: '#EAB308',
    particleType: 'coins',
  },
  'wedding-season': {
    id: 'wedding-season',
    name: 'Imperial Vivaha / Royal Bridal Season',
    subtitle: 'Opulent velvet crimson, Padmavati chokers & private bridal lounge',
    badge: 'Imperial Bridal Edition',
    iconName: 'heart',
    primaryColor: '#280A12',
    primaryDark: '#18040A',
    accentGold: '#DFB76C',
    accentGoldDark: '#C59B27',
    bgWarm: '#FAF6F4',
    bgSurface: '#FDE8E8',
    heroTagline: 'THE GRAND IMPERIAL BRIDAL ATELIER',
    heroHeadline: 'Crowning Moments with Mastercrafted Jadau & Temple Gold',
    announcementText: '👑 Imperial Bridal Season • Book Your Private VIP Lounge Trial at Haldwani Nanda Vihar Boutique • Call 7668037278',
    festiveDiscountNote: 'Complimentary Solitaire Nose Pin on Complete Bridal Jewelry Packages',
    accentBorder: '#C59B27',
    particleType: 'petals',
  },
  'midnight-sapphire': {
    id: 'midnight-sapphire',
    name: 'Midnight Sapphire & Diamond Gala',
    subtitle: 'Deep celestial cobalt, icy solitaire brilliance & platinum elegance',
    badge: 'Solitaire Gala Edition',
    iconName: 'gem',
    primaryColor: '#07152B',
    primaryDark: '#030B17',
    accentGold: '#38BDF8',
    accentGoldDark: '#0284C7',
    bgWarm: '#F8FAFC',
    bgSurface: '#E0F2FE',
    heroTagline: 'IGI CERTIFIED SOLITAIRES & EMERALDS',
    heroHeadline: 'Celestial Brilliance in 18K White Gold & Fine Diamonds',
    announcementText: '💎 Midnight Solitaire Gala • Certified IGI & GIA Diamonds with 100% Lifetime Buyback & Exchange Guarantee',
    festiveDiscountNote: 'Flat 20% OFF on Diamond Value for all Solitaire Engagement Rings',
    accentBorder: '#38BDF8',
    particleType: 'diamonds',
  },
};

interface ThemeContextType {
  activeTheme: OccasionTheme;
  activeThemeId: OccasionThemeId;
  setTheme: (id: OccasionThemeId) => void;
  particlesEnabled: boolean;
  setParticlesEnabled: (enabled: boolean) => void;
  customAnnouncement: string;
  setCustomAnnouncement: (announcement: string) => void;
  availableThemes: OccasionTheme[];
  applyRemoteThemeUpdate: (themeData: { activeThemeId?: OccasionThemeId; particlesEnabled?: boolean; customAnnouncement?: string }) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeThemeId, setActiveThemeId] = useState<OccasionThemeId>(() => {
    const saved = localStorage.getItem('dhanlaxmi_active_theme');
    return (saved && THEMES[saved as OccasionThemeId]) ? (saved as OccasionThemeId) : 'default';
  });

  const [particlesEnabled, setParticlesEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('dhanlaxmi_particles_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const [customAnnouncement, setCustomAnnouncement] = useState<string>(() => {
    return localStorage.getItem('dhanlaxmi_custom_announcement') || '';
  });

  const activeTheme = THEMES[activeThemeId] || THEMES.default;

  const applyRemoteThemeUpdate = (themeData: { activeThemeId?: OccasionThemeId; particlesEnabled?: boolean; customAnnouncement?: string }) => {
    if (themeData.activeThemeId && THEMES[themeData.activeThemeId]) {
      setActiveThemeId(themeData.activeThemeId);
      localStorage.setItem('dhanlaxmi_active_theme', themeData.activeThemeId);
    }
    if (themeData.particlesEnabled !== undefined) {
      setParticlesEnabled(themeData.particlesEnabled);
      localStorage.setItem('dhanlaxmi_particles_enabled', String(themeData.particlesEnabled));
    }
    if (themeData.customAnnouncement !== undefined) {
      setCustomAnnouncement(themeData.customAnnouncement);
      localStorage.setItem('dhanlaxmi_custom_announcement', themeData.customAnnouncement);
    }
  };

  const handleSetTheme = (id: OccasionThemeId) => {
    if (THEMES[id]) {
      setActiveThemeId(id);
      localStorage.setItem('dhanlaxmi_active_theme', id);
      // Synchronize with backend liveConfig for zero-delay broadcast to all devices
      fetch('/api/config/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeThemeId: id, particlesEnabled, customAnnouncement })
      }).catch(err => console.warn('Theme live sync dispatch error:', err));
    }
  };

  const handleSetParticlesEnabled = (enabled: boolean) => {
    setParticlesEnabled(enabled);
    localStorage.setItem('dhanlaxmi_particles_enabled', String(enabled));
    fetch('/api/config/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activeThemeId, particlesEnabled: enabled, customAnnouncement })
    }).catch(err => console.warn('Theme particles live sync error:', err));
  };

  const handleSetCustomAnnouncement = (ann: string) => {
    setCustomAnnouncement(ann);
    localStorage.setItem('dhanlaxmi_custom_announcement', ann);
    fetch('/api/config/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activeThemeId, particlesEnabled, customAnnouncement: ann })
    }).catch(err => console.warn('Custom announcement sync error:', err));
  };

  // Sync CSS variables dynamically on root element
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', activeTheme.primaryColor);
    root.style.setProperty('--theme-primary-dark', activeTheme.primaryDark);
    root.style.setProperty('--theme-accent', activeTheme.accentGold);
    root.style.setProperty('--theme-accent-dark', activeTheme.accentGoldDark);
    root.style.setProperty('--theme-bg-warm', activeTheme.bgWarm);
    root.style.setProperty('--theme-bg-surface', activeTheme.bgSurface);
    root.style.setProperty('--theme-border', activeTheme.accentBorder);
    root.setAttribute('data-theme', activeTheme.id);
  }, [activeTheme]);

  return (
    <ThemeContext.Provider
      value={{
        activeTheme,
        activeThemeId,
        setTheme: handleSetTheme,
        particlesEnabled,
        setParticlesEnabled: handleSetParticlesEnabled,
        customAnnouncement,
        setCustomAnnouncement: handleSetCustomAnnouncement,
        availableThemes: Object.values(THEMES),
        applyRemoteThemeUpdate,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
