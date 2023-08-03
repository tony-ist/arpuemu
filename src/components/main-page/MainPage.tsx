import { useContext, useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { PMemViewer } from '../pmem-viewer/PMemViewer.tsx';
import { RegViewer } from '../reg-viewer/RegViewer.tsx';
import styles from '../App.module.css';
import { EmulatorContext } from '../App.tsx';
import { FlagsViewer } from '../flags-viewer/FlagsViewer.tsx';
import { HexViewer } from '../hex/HexViewer.tsx';
import { toHex } from '../../asm/asm-util.ts';

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
          <Box>
            <Box>PC {toHex([emulatorState.PC])}</Box>
            <PMemViewer
              machineCode={emulatorState.PMEM}
            />
            <RegViewer
              registers={emulatorState.registers}
            />
            <FlagsViewer
              ZF={emulatorState.ZF}
              COUTF={emulatorState.COUTF}
              MSBF={emulatorState.MSBF}
              LSBF={emulatorState.LSBF}
            />
            <HexViewer
              title="Input Ports"
              machineCode={emulatorState.inputPorts}
            />
            <HexViewer
              title="Output Ports"
              machineCode={emulatorState.outputPorts}
            />
          </Box>
        }
        {
          error &&
          <Box className={styles.errorContainer}>{error}</Box>
        }
      </Box>
    </>
  );
}
