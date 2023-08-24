import styles from './EmulatorControls.module.css';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import React from 'react';

interface EmulatorControlsPropsType {
  compile: () => void;
  step: () => void;
  run: () => void;
  stop: () => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  isRunning: boolean;
}

export function EmulatorControls(props: EmulatorControlsPropsType) {
  const { compile, step, run, stop, isRunning, isEditing, setIsEditing } = props;
  return (
    <Box className={styles.buttonsContainer}>
      <Box>
        <Button
          variant="contained"
          onClick={compile}
        >
          {isEditing ? 'Compile' : 'Reset'}
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
  );
}