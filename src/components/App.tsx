import { MainPage } from './main-page/MainPage.tsx';
import { createContext, useState } from 'react';
import { ARPUEmulator, ARPUEmulatorState } from '../emulator/ARPUEmulator.ts';

export interface EmulatorAndStateType {
  emulator: ARPUEmulator;
  emulatorState: ARPUEmulatorState;
}

export interface EmulatorContextType {
  emulatorState: ARPUEmulatorState | null;
  initEmulator: (asmCode: string) => void;
  step: () => void;
}

const emulatorFunctionStub = () => {
  throw new Error('This context should be initialized inside a component with a state');
}

export const EmulatorContext = createContext<EmulatorContextType>({
  emulatorState: null,
  initEmulator: emulatorFunctionStub,
  step: emulatorFunctionStub,
});

export function App() {
  const [emulatorAndState, setEmulatorAndState] = useState<EmulatorAndStateType | null>(null);

  function initEmulator(asmCode: string) {
    const emulator = new ARPUEmulator(asmCode);
    setEmulatorAndState( {
      emulator,
      emulatorState: emulator.getState(),
    })
  }

  function step() {
    const error  = new Error('Invalid state: step function is called on uninitialized emulator')

    if (emulatorAndState === null) {
      throw error
    }

    emulatorAndState.emulator.step();

    setEmulatorAndState((prevState) => {
      if (prevState === null) {
        throw error
      }

      return {
        emulator: prevState.emulator,
        emulatorState: prevState.emulator.getState(),
      }
    });
  }

  return (
    <EmulatorContext.Provider value={{
      emulatorState: emulatorAndState === null ? null: emulatorAndState.emulatorState,
      initEmulator,
      step,
    }}>
      <MainPage />
    </EmulatorContext.Provider>
  );
}
