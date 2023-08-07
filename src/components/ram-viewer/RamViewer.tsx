import { HexViewer } from '../hex/HexViewer.tsx';

interface RamViewerPropTypes {
  binaryData: number[]
}

export function RamViewer(props: RamViewerPropTypes) {
  const { binaryData } = props;

  return (
    <HexViewer
      title={'RAM'}
      binaryData={binaryData}
    />
  );
}

