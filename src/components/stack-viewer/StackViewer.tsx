import { HexViewer } from '../hex/HexViewer.tsx';
import Box from '@mui/material/Box';

interface StackViewerPropTypes {
  machineCode: number[]
}

export function StackViewer(props: StackViewerPropTypes) {
  const { machineCode } = props;

  return (
    <Box sx={{ minHeight: 43 }}>
      <HexViewer
        title={'Stack'}
        machineCode={machineCode}
      />
    </Box>
  );
}

