import { HexViewer } from '../hex/HexViewer.tsx';

interface PMemViewerPropTypes {
  machineCode: number[]
}

export function PMemViewer(props: PMemViewerPropTypes) {
  const { machineCode } = props;

  return (
    <HexViewer
      title={'Program Memory'}
      machineCode={machineCode}
    />
  );
}

