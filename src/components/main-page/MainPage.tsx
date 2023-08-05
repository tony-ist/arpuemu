import React, { useContext, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { PMemViewer } from '../pmem-viewer/PMemViewer.tsx';
import { RegViewer } from '../reg-viewer/RegViewer.tsx';
import { EmulatorContext } from '../App.tsx';
import { FlagsViewer } from '../flags-viewer/FlagsViewer.tsx';
import { HexViewer } from '../hex/HexViewer.tsx';
import { toHex } from '../../asm/asm-util.ts';
import { StackViewer } from '../stack-viewer/StackViewer.tsx';
import { RamViewer } from '../ram-viewer/RamViewer.tsx';
import { Container } from '@mui/material';
import styles from './MainPage.module.css';

export function MainPage() {
  const { initEmulator, emulatorState, step: emulatorStep, portInput: emulatorPortInput } = useContext(EmulatorContext);
  const [asmCode, setAsmCode] = useState('');
  const [portInputValue, setPortInputValue] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timer | null>(null);

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
    stop();
    setError(null);
    setPortInputValue('');
    try {
      initEmulator(asmCode);
    } catch (error) {
      console.error(error);
      setError((error as Error).message);
    }
  }

  function step() {
    if (emulatorState === null) {
      throw new Error('Should initialize emulator before using step on it');
    }

    setError(null);

    try {
      emulatorStep();
    } catch (error) {
      handleError(error as Error);
    }
  }

  function handleError(error: Error) {
    console.error(error);
    setError(error.message);
  }

  function run() {
    intervalRef.current = setInterval(() => {
      if (emulatorState === null) {
        throw new Error('Should initialize emulator before using run on it');
      }
      if (!emulatorState.isWaitingPortInput) {
        step();
      }
    }, 100);
    setIsRunning(true);
  }

  function stop() {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
    }
    setIsRunning(false);
  }

  function portInput() {
    if (emulatorState === null) {
      throw new Error('Should initialize emulator before using port input on it');
    }

    if (emulatorState.isWaitingPortInput) {
      try {
        if (portInputValue === '') {
          throw new Error('You should write port input value first');
        }
        emulatorPortInput(portInputValue);
        setPortInputValue('');
      } catch (error) {
        handleError(error as Error);
      }
    } else {
      throw new Error('Using port input while not waiting for port input');
    }
  }

  function onPortInputKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.code === 'Enter') {
      portInput();
    }
  }

  return (
    <>
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
          <Box sx={{ width: 500 }}>
            <TextField
              label='ASM Code'
              value={asmCode}
              onChange={(textArea) => setAsmCode(textArea.target.value)}
              multiline
              fullWidth
              maxRows={30}
              inputProps={{ style: { fontFamily: 'RobotoMono, sans-serif' } }}
            />
            <Box className={styles.buttonsContainer}>
              <Box>
                <Button
                  variant="contained"
                  onClick={compile}
                >
                  Compile
                </Button>
              </Box>
              <Box>
                <Button
                  variant="text"
                  onClick={step}
                  disabled={emulatorState === null}
                >
                  Step
                </Button>
              </Box>
              <Box>
                <Button
                  variant="text"
                  onClick={run}
                  disabled={emulatorState === null || isRunning}
                >
                  Run
                </Button>
              </Box>
              <Box>
                <Button
                  variant="text"
                  onClick={stop}
                  disabled={emulatorState === null || !isRunning}
                >
                  Stop
                </Button>
              </Box>
            </Box>
          </Box>
          <Box sx={{ width: 500 }}>
            {
              error &&
              <Box className={styles.errorContainer}>{error}</Box>
            }
            {
              emulatorState &&
              <Box className={styles.emulatorStateContainer}>
                {
                  emulatorState?.isWaitingPortInput &&
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      autoFocus
                      label="Port Input (dec, hex or bin)"
                      value={portInputValue}
                      onKeyDown={onPortInputKeyDown}
                      onChange={(event) => setPortInputValue(event.target.value)}
                    />
                    <Button
                      sx={{ marginLeft: '20px' }}
                      variant='contained'
                      onClick={portInput}
                    >
                      Ok
                    </Button>
                  </Box>
                }
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
                <StackViewer
                  machineCode={emulatorState.stack}
                />
                <FlagsViewer
                  ZF={emulatorState.ZF}
                  COUTF={emulatorState.COUTF}
                  MSBF={emulatorState.MSBF}
                  LSBF={emulatorState.LSBF}
                />
                <HexViewer
                  title="Input Ports"
                  binaryData={emulatorState.inputPorts}
                />
                <HexViewer
                  title="Output Ports"
                  binaryData={emulatorState.outputPorts}
                />
                <RamViewer
                  machineCode={emulatorState.RAM}
                />
              </Box>
            }
          </Box>
        </Box>
      </Container>
    </>
  );
}
