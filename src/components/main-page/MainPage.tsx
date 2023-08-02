import { useContext, useRef, useState } from 'react';
import { ARPUEmulator } from '../../emulator/ARPUEmulator.ts';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { PMemViewer } from '../pmem-viewer/PMemViewer.tsx';
import { RegViewer } from '../reg-viewer/RegViewer.tsx';
import styles from '../App.module.css';
import { EmulatorContext } from '../App.tsx';

export function MainPage() {
  const emulator = useContext(EmulatorContext);
  const [asmCode, setAsmCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [stepNumber, setStepNumber] = useState<number | null>(null);
  /*
        {
          emulator &&
          <PMemViewer
            machineCode={emulator.getProgramMemory()}
          />
        }
        {
          emulator &&
          <RegViewer
            registers={emulator.getRegisters()}
          />
        }
   */
  function compile() {
    setError(null);
    try {
      setStepNumber(0);
    } catch (error) {
      console.error(error);
      setError((error as Error).message);
    }
  }

  function step() {
    if (stepNumber === null) {
      throw new Error('Trying to make a step while stepNumber is uninitialised');
    }
    setStepNumber((stepNumber) => stepNumber === null ? 0 : stepNumber + 1);
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
          variant='contained'
          onClick={compile}
        >
          Compile
        </Button>
        <Button
          variant='text'
          onClick={step}
          disabled={true}
        >
          Step
        </Button>
        {
          error &&
            <Box className={styles.errorContainer}>{ error }</Box>
        }
      </Box>
    </>
  )
}
