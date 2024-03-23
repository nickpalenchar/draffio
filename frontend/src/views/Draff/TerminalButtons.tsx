import { Button, Flex, Icon } from '@chakra-ui/react';
import React, { FC, MouseEventHandler } from 'react';
import { IoTrashBin } from 'react-icons/io5';

interface TerminalButtonsProps {
  onClear: MouseEventHandler<HTMLButtonElement>;
}

export const TerminalButtons: FC<TerminalButtonsProps> = ({ onClear }) => {
  return (
    <>
      <Flex justify={'center'}>
        <Button
          margin={2}
          variant={'outline'}
          color="white"
          _hover={{ color: 'gray.600', backgroundColor: 'white' }}
          size="sm"
          minW="7em"
          borderRadius={0}
          colorScheme={'gray'}
          onClick={onClear}
          rightIcon={<IoTrashBin />}
        >
          Clear
        </Button>
      </Flex>
    </>
  );
};
