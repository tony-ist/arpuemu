import Box from '@mui/material/Box';
import styles from '../main-page/MainPage.module.css';
import { toHex } from '../../asm/asm-util.ts';
import { PMemViewer } from '../pmem-viewer/PMemViewer.tsx';
import { RegViewer } from '../reg-viewer/RegViewer.tsx';
import { StackViewer } from '../stack-viewer/StackViewer.tsx';
import { FlagsViewer } from '../flags-viewer/FlagsViewer.tsx';
import { HexViewer } from '../hex/HexViewer.tsx';
import { RamViewer } from '../ram-viewer/RamViewer.tsx';
import React from 'react';
import { ARPUEmulatorState } from '../../emulator/ARPUEmulator.ts';

interface EmulatorStatePropsType {
  emulatorState: ARPUEmulatorState;
}

export function EmulatorStateViewer(props: EmulatorStatePropsType) {
  const { emulatorState } = props;

  return (
    <Box className={styles.emulatorStateContainer}>
      <Box>Cycle (decimal): {emulatorState.cycle}</Box>
      <Box>PC (hex): {toHex([emulatorState.PC])}</Box>
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
  );
}