import TextField from '@mui/material/TextField'
import { useState } from 'react';
import styles from './App.module.css'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

function App() {
  const [code, setCode] = useState('');

  return (
    <>
      <Box>
        <TextField
          onChange={(textArea) => setCode(textArea.target.value)}
          multiline
        />
        <div className={styles.container}>{code}</div>
        <Button variant='contained'>Run</Button>
      </Box>
    </>
  )
}

export default App
