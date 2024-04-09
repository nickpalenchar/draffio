import { Button, Flex, Icon, Tooltip } from '@chakra-ui/react';
import React, { FC, MouseEventHandler, useCallback, useState } from 'react';
import { FaPaperPlane, FaSave } from 'react-icons/fa';
import { HiMiniPlay } from 'react-icons/hi2';

interface EditorButtonProps {
  onRun: MouseEventHandler<HTMLButtonElement>;
  onSave: MouseEventHandler<HTMLButtonElement>;
  disable: boolean;
}

export const EditorButtons: FC<EditorButtonProps> = ({
  onRun,
  onSave,
  disable = false,
}) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const onClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    async (event) => {
      setIsSaving(true);
      await onSave(event);
      setIsSaving(false);
    },
    [],
  );

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
          rightIcon={<FaSave />}
          loadingText="Saving"
          isDisabled={isSaving}
          isLoading={isSaving}
          onClick={onClick}
        >
          Save
        </Button>
        <Button
          margin={2}
          size="sm"
          minW="7em"
          isDisabled={disable}
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
