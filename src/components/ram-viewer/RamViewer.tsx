import Box from '@mui/material/Box';
import { toHex } from '../../asm/util.ts';

interface RamViewerPropTypes {
  machineCode: number[]
}

export function RamViewer(props: RamViewerPropTypes) {
  const { machineCode } = props;
  const machineCodeStr = toHex(machineCode).join(' ');

  return (
    <Box>{ machineCodeStr }</Box>
  );
}

