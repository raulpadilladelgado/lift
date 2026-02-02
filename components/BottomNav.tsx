import React from 'react';
import { Home, BarChart3, Settings } from 'lucide-react';
import { t } from '../utils/translations';

export type ScreenType = 'home' | 'insights' | 'settings';

interface Props {
  currentScreen: ScreenType;
  onScreenChange: (screen: ScreenType) => void;
}

export const BottomNav: React.FC<Props> = ({ currentScreen, onScreenChange }) => {
  const navItems: { id: ScreenType; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: t.labels.home || 'Home', icon: <Home size={24} /> },
    { id: 'insights', label: t.labels.insights || 'Insights', icon: <BarChart3 size={24} /> },
    { id: 'settings', label: t.labels.settings || 'Settings', icon: <Settings size={24} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-ios-card/95 backdrop-blur-md border-t border-ios-separator z-30">
      <div className="flex justify-around max-w-md mx-auto sm:max-w-md">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onScreenChange(item.id)}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-1.5 transition-colors active:opacity-70 ${
              currentScreen === item.id
                ? 'text-ios-blue'
                : 'text-ios-gray hover:text-ios-text'
            }`}
            aria-label={item.label}
          >
            <div className="w-6 h-6 flex items-center justify-center">{item.icon}</div>
            <span className="text-xs font-semibold text-center leading-none truncate">{item.label}</span>
            {currentScreen === item.id && (
              <div className="h-0.5 w-8 bg-ios-blue rounded-full mt-0.5"></div>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};
