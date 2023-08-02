import { useContext, useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { PMemViewer } from '../pmem-viewer/PMemViewer.tsx';
import { RegViewer } from '../reg-viewer/RegViewer.tsx';
import styles from '../App.module.css';
import { EmulatorContext } from '../App.tsx';

export function MainPage() {
  const { initEmulator, emulatorState, step: emulatorStep } = useContext(EmulatorContext);
  const [asmCode, setAsmCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  function compile() {
    setError(null);
    try {
      initEmulator(asmCode);
    } catch (error) {
      console.error(error);
      setError((error as Error).message);
    }
  }

  function step() {
    if (emulatorState === null) {
      throw new Error('Should initialize emulator before using it');
    }

    try {
      emulatorStep();
    } catch (error) {
      console.error(error);
      setError((error as Error).message);
    }
  }

  return (
    <>
      <Box>
        <TextField
          onChange={(textArea) => setAsmCode(textArea.target.value)}
          multiline
          fullWidth
        />
        <Button
          variant="contained"
          onClick={compile}
        >
          Compile
        </Button>
        <Button
          variant="text"
          onClick={step}
          disabled={emulatorState === null}
        >
          Step
        </Button>
        {
          emulatorState &&
            <PMemViewer
                machineCode={emulatorState.PMEM}
            />
        }
        {
          emulatorState &&
            <RegViewer
                registers={emulatorState.registers}
            />
        }
        {
          error &&
            <Box className={styles.errorContainer}>{error}</Box>
        }
      </Box>
    </>
  );
}
