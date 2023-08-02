import { HexViewer } from '../hex/HexViewer.tsx';

interface StackViewerPropTypes {
  machineCode: number[]
}

export function StackViewer(props: StackViewerPropTypes) {
  const { machineCode } = props;

  return (
    <HexViewer
      title={'Stack'}
      machineCode={machineCode}
    />
  )
}

