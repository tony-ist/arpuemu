import Box from '@mui/material/Box';
import { toHex } from '../../asm/util.ts';

interface HexViewerPropTypes {
  title: string;
  machineCode: number[];
}

export function HexViewer(props: HexViewerPropTypes) {
  const { title, machineCode } = props;
  const machineCodeStr = toHex(machineCode).join(' ');

  return (
    <Box>
      <Box>{ title }</Box>
      <Box>{ machineCodeStr }</Box>
    </Box>
  );
}

