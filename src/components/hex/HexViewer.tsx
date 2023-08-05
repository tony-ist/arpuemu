import Box from '@mui/material/Box';
import { toHex } from '../../asm/asm-util.ts';
import styles from './HexViewer.module.css';
import { groupElements } from '../../util/common-util.ts';
import { generateLabels, VALUES_IN_A_ROW } from '../../util/hex-viewer-util.ts';

interface HexViewerPropTypes {
  title: string;
  binaryData: number[];
  highlightByte?: number;
  highlightSize?: number;
}

export function HexViewer(props: HexViewerPropTypes) {
  const { title, binaryData, highlightByte, highlightSize: defaultHighlightSize } = props;
  const highlightSize = defaultHighlightSize ? defaultHighlightSize : 1;
  const hexData = toHex(binaryData);
  const groupedHexData = groupElements(hexData, VALUES_IN_A_ROW);
  const labels = generateLabels(hexData.length);

  function highlightClassName(groupIndex: number, elementIndex: number) {
    if (highlightByte === undefined) {
      return '';
    }

    const index = groupIndex * VALUES_IN_A_ROW + elementIndex;

    if (index === highlightByte || index === highlightByte + highlightSize - 1) {
      return styles.highlight;
    }

    return '';
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box>{title}</Box>
      <Box>
        {
          groupedHexData.map((group, groupIndex) =>
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <Box>{ labels[groupIndex] }</Box>
              <Box sx={{ marginRight: 1 }}>|</Box>
              <Box>
                {
                  group.map((hex, elementIndex) =>
                    <Box
                      key={`${groupIndex}-${elementIndex}`}
                      className={highlightClassName(groupIndex, elementIndex)}
                      sx={{ display: 'inline-block' }}
                      marginRight={1}
                    >
                      {hex}
                    </Box>
                  )
                }
              </Box>
            </Box>
          )
        }
      </Box>
    </Box>
  );
}

