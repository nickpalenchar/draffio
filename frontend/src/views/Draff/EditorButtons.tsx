import { Button, Flex, Icon, Tooltip } from '@chakra-ui/react';
import React, { FC, MouseEventHandler } from 'react';
import { FaPaperPlane, FaSave } from 'react-icons/fa';
import { HiMiniPlay } from 'react-icons/hi2';

interface EditorButtonProps {
  onRun: MouseEventHandler<HTMLButtonElement>;
}

export const EditorButtons: FC<EditorButtonProps> = ({ onRun }) => {
  return (
    <>
      <Flex bg="yellow.50" justify={'center'}>
        <Tooltip label="Soon." placement={'top'}>
          <Button
            margin={2}
            size="sm"
            minW="7em"
            borderRadius={0}
            colorScheme="orange"
            isDisabled={true}
            rightIcon={<FaPaperPlane />}
          >
            Share
          </Button>
        </Tooltip>
        <Button
          margin={2}
          size="sm"
          minW="7em"
          borderRadius={0}
          colorScheme="orange"
          isDisabled={true}
          rightIcon={<FaSave />}
        >
          Save
        </Button>
        <Button
          margin={2}
          size="sm"
          minW="7em"
          borderRadius={0}
          colorScheme={'teal'}
          onClick={onRun}
        >
          Run <Icon as={HiMiniPlay} marginLeft={1} />
        </Button>
      </Flex>
    </>
  );
};
