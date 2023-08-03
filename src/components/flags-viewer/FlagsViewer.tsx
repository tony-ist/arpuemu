import { HexViewer } from '../hex/HexViewer.tsx';

interface FlagsViewerPropTypes {
  ZF: boolean;
  COUTF: boolean;
  MSBF: boolean;
  LSBF: boolean;
}

export function FlagsViewer(props: FlagsViewerPropTypes) {
  const { ZF, COUTF, MSBF, LSBF } = props;

  return (
    <HexViewer
      title={'Flags'}
      machineCode={[ZF, COUTF, MSBF, LSBF].map((flag) => flag ? 1 : 0)}
    />
  );
}

