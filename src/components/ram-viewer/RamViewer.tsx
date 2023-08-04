import { HexViewer } from '../hex/HexViewer.tsx';

interface RamViewerPropTypes {
  machineCode: number[]
}

export function RamViewer(props: RamViewerPropTypes) {
  const { machineCode } = props;

  return (
    <HexViewer
      title={'RAM'}
      machineCode={machineCode}
    />
  );
}

