import React from 'react';
import type { Screen } from '../App';
import CheckinIcon from './icons/CheckinIcon';
import UsersIcon from './icons/UsersIcon';
import ChartIcon from './icons/ChartIcon';
import CalendarIcon from './icons/CalendarIcon';
import HistoryIcon from './icons/HistoryIcon';

interface BottomNavProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
}

// FIX: Extracted props to an interface and typed NavItem as React.FC to fix the error with the 'key' prop.
interface NavItemProps {
  screen: Screen;
  label: string;
  Icon: React.ElementType;
  activeScreen: Screen;
  onClick: (screen: Screen) => void;
}

const NavItem: React.FC<NavItemProps> = ({
  screen,
  label,
  Icon,
  activeScreen,
  onClick,
}) => {
  const isActive = activeScreen === screen;
  return (
    <button
      onClick={() => onClick(screen)}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
        isActive ? 'text-brand-purple' : 'text-slate-500 hover:text-brand-purple'
      }`}
    >
      <Icon className="w-6 h-6 mb-1" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

export default function BottomNav({ activeScreen, setActiveScreen }: BottomNavProps) {
  const navItems = [
    { screen: 'checkin' as Screen, label: 'Check-in', Icon: CheckinIcon },
    { screen: 'alunos' as Screen, label: 'Alunos', Icon: UsersIcon },
    { screen: 'historico' as Screen, label: 'Histórico', Icon: HistoryIcon },
    { screen: 'relatorios' as Screen, label: 'Relatórios', Icon: ChartIcon },
    { screen: 'diarias' as Screen, label: 'Diárias', Icon: CalendarIcon },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-16 bg-white border-t border-slate-200 shadow-md">
      <div className="flex justify-around items-stretch h-full">
        {navItems.map((item) => (
          <NavItem
            key={item.screen}
            screen={item.screen}
            label={item.label}
            Icon={item.Icon}
            activeScreen={activeScreen}
            onClick={setActiveScreen}
          />
        ))}
      </div>
    </div>
  );
}
