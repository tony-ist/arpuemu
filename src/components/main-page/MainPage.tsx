import React, { useContext, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { EmulatorContext } from '../App.tsx';
import { Container } from '@mui/material';
import styles from './MainPage.module.css';
import { CodeEditor } from '../code-editor/CodeEditor.tsx';
import { EmulatorStateViewer } from '../state-viewer/EmulatorStateViewer.tsx';
import { PortInput } from '../port-input/PortInput.tsx';

export function MainPage() {
  const { initEmulator, emulatorState, step: emulatorStep, portInput: emulatorPortInput } = useContext(EmulatorContext);
  const [asmCode, setAsmCode] = useState('');
  const [portInputValue, setPortInputValue] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
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
      setIsEditing(false);
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
    }, 1);
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

  return (
    <>
      <Container>
        <Box className={styles.panelsContainer} sx={{ display: 'flex', justifyContent: 'space-around' }}>
          <Box>
            <CodeEditor
              isEditing={isEditing}
              asmLines={emulatorState?.asmLines}
              currentLineIndex={emulatorState?.lineIndex}
              asmCode={asmCode}
              setAsmCode={setAsmCode}
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
                  variant='text'
                  onClick={() => setIsEditing(true)}
                  disabled={isEditing}
                >
                  Edit
                </Button>
              </Box>
              <Box>
                <Button
                  variant="text"
                  onClick={step}
                  disabled={isEditing}
                >
                  Step
                </Button>
              </Box>
              <Box>
                <Button
                  variant="text"
                  onClick={run}
                  disabled={isEditing || isRunning}
                >
                  Run
                </Button>
              </Box>
              <Box>
                <Button
                  variant="text"
                  onClick={stop}
                  disabled={isEditing || !isRunning}
                >
                  Stop
                </Button>
              </Box>
            </Box>
          </Box>
          <Box>
            {
              error &&
              <Box className={styles.errorContainer}>{error}</Box>
            }
            {
              emulatorState &&
              <Box>
                {
                  emulatorState.isWaitingPortInput &&
                  <PortInput
                    triggerPortInput={portInput}
                    portInputValue={portInputValue}
                    setPortInputValue={setPortInputValue}
                  />
                }
                <EmulatorStateViewer emulatorState={emulatorState} />
              </Box>
            }
          </Box>
        </Box>
      </Container>
    </>
  );
}
