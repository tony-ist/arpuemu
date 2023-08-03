import { useContext, useEffect, useState } from 'react';
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
  const { initEmulator, emulatorState, step: emulatorStep, portInput } = useContext(EmulatorContext);
  const [asmCode, setAsmCode] = useState('');
  const [portInputValue, setPortInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const asmCode = localStorage.getItem('asmCode');
    if (asmCode !== null) {
      setAsmCode(asmCode);
    }
  }, []);

  useEffect(() => {
    if (asmCode !== '') {
      localStorage.setItem('asmCode', asmCode);
    }
  }, [asmCode]);

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

    setError(null);

    try {
      if (emulatorState.isWaitingPortInput) {
        if (portInputValue === '') {
          throw new Error('You should write port input value first');
        }

        portInput(portInputValue);
        return;
      }

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
          value={asmCode}
          onChange={(textArea) => setAsmCode(textArea.target.value)}
          multiline
          fullWidth
          inputProps={{ style: { fontFamily: 'RobotoMono, sans-serif' } }}
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
            <Box>Cycle (decimal) {emulatorState.cycle}</Box>
            <Box>PC (hex) {toHex([emulatorState.PC])}</Box>
            <PMemViewer
              machineCode={emulatorState.PMEM}
              highlightByte={emulatorState.PC}
              highlightSize={emulatorState.asmLines[emulatorState.lineIndex]?.getSizeInBytes()}
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
          emulatorState?.isWaitingPortInput &&
          <TextField
            label="Port Input"
            value={portInputValue}
            onChange={(textArea) => setPortInputValue(textArea.target.value)}
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
