import { HexViewer } from '../hex/HexViewer.tsx';

interface RegViewerPropTypes {
  registers: number[]
}

export function RegViewer(props: RegViewerPropTypes) {
  const { registers } = props;

  return (
    <HexViewer
      title={'Registers'}
      binaryData={registers}
    />
  );
}

