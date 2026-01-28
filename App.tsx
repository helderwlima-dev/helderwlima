import React, { useState } from 'react';
import BottomNav from './components/BottomNav';
import CheckinScreen from './screens/CheckinScreen';
import AlunosScreen from './screens/AlunosScreen';
import ReportsScreen from './screens/ReportsScreen';
import DiariasScreen from './screens/DiariasScreen';
import ImportScreen from './screens/ImportScreen';
import CheckinsHistoryScreen from './screens/CheckinsHistoryScreen';

export type Screen = 'checkin' | 'alunos' | 'relatorios' | 'diarias' | 'importar' | 'historico';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('checkin');

  const renderScreen = () => {
    switch (activeScreen) {
      case 'checkin':
        return <CheckinScreen setActiveScreen={setActiveScreen} />;
      case 'alunos':
        return <AlunosScreen setActiveScreen={setActiveScreen} />;
      case 'relatorios':
        return <ReportsScreen />;
      case 'diarias':
        return <DiariasScreen />;
      case 'importar':
        return <ImportScreen />;
      case 'historico':
        return <CheckinsHistoryScreen />;
      default:
        return <CheckinScreen setActiveScreen={setActiveScreen} />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
      <div className="max-w-md mx-auto bg-white shadow-lg min-h-screen flex flex-col">
        <main className="flex-grow p-4 pb-24">
          {renderScreen()}
        </main>
        <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
      </div>
    </div>
  );
}