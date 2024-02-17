import React from 'react';
import { Flex, Square, Box } from '@chakra-ui/react';

export const Draff = () => {
  return (
    <Flex height="100vh" bg="red">
      <Box minWidth="50%" bg="yellow">
        textedit 1
      </Box>
      <Box>textedit 2</Box>
    </Flex>
  );
};
