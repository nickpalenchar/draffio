import React, { FC } from 'react';
import { Box, VStack } from '@chakra-ui/react';
interface EditorParams {
  editorRef?: React.RefObject<HTMLDivElement>;
}

export const Editor: FC<EditorParams> = ({ editorRef }) => {
  return (
    <VStack>
      <Box
        width="100%"
        height="640px"
        maxHeight={{ base: '120vw', md: '100%' }}
        overflowY={'scroll'}
        overflowX={'hidden'}
      >
        <Box background="yellow.50">
          {' '}
          <Box maxHeight="100%" width="100%" ref={editorRef} />
        </Box>
      </Box>
    </VStack>
  );
};
