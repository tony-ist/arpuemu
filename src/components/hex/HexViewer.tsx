import Box from '@mui/material/Box';
import { toHex } from '../../asm/asm-util.ts';
import styles from './HexViewer.module.css';

interface HexViewerPropTypes {
  title: string;
  machineCode: number[];
  highlightByte?: number;
  highlightSize?: number;
}

export function HexViewer(props: HexViewerPropTypes) {
  const { title, machineCode, highlightByte, highlightSize: defaultHighlightSize } = props;
  const highlightSize = defaultHighlightSize ? defaultHighlightSize : 1;
  const machineCodeHex = toHex(machineCode);

  function highlightClassName(index: number) {
    if (highlightByte === undefined) {
      return '';
    }

    if (index === highlightByte || index === highlightByte + highlightSize - 1) {
      return styles.highlight;
    }

    return '';
  }

  return (
    <Box>
      <Box>{title}</Box>
      {
        machineCodeHex.map((hex, index) =>
          <Box
            key={index}
            className={highlightClassName(index)}
            sx={{ display: 'inline' }}
            marginRight={1}
          >
            {hex}
          </Box>
        )
      }
    </Box>
  );
}

