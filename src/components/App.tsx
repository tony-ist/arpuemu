import { MainPage } from './main-page/MainPage.tsx';
import { createContext } from 'react';
import { ARPUEmulator } from '../emulator/ARPUEmulator.ts';

export const EmulatorContext = createContext<ARPUEmulator | null>(null);

export function App() {
  return (
    <EmulatorContext.Provider value={null}>
      <MainPage />
    </EmulatorContext.Provider>
  );
}
