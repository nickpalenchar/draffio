import {
  Button,
  Flex,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  position,
  useToast,
} from '@chakra-ui/react';
import React, {
  FC,
  MouseEventHandler,
  useCallback,
  useState,
  useRef,
} from 'react';
import { FaPaperPlane, FaSave } from 'react-icons/fa';
import { HiMiniPlay } from 'react-icons/hi2';

interface EditorButtonProps {
  onRun: MouseEventHandler<HTMLButtonElement>;
  onSave: MouseEventHandler<HTMLButtonElement>;
  disable: boolean;
  isSaving: boolean;
  shareUrl: string;
}

export const EditorButtons: FC<EditorButtonProps> = ({
  onRun,
  onSave,
  disable = false,
  isSaving = false,
  shareUrl,
}) => {
  const shareLinkInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const onShareLinkClick = async () => {
    console.log('click it ');
    const input = shareLinkInputRef.current;
    if (!input) {
      return;
    }
    input.select();
    try {
      await navigator.clipboard.writeText(input.value);
      toast({
        title: 'Link copied!',
        status: 'success',
        duration: 1200,
        isClosable: false,
        position: 'top',
      });
    } catch (e) {}
  };

  const isNew = new URL(shareUrl).pathname === '/js/new';

  return (
    <>
      <Flex bg="yellow.50" justify={'center'}>
        <Popover placement="top-start">
          <Tooltip label={isNew ? 'Save first' : null} placement="bottom">
            {isNew ? (
              <Button
                margin={2}
                size="sm"
                minW="7em"
                borderRadius={0}
                colorScheme="orange"
                rightIcon={<FaPaperPlane />}
                isDisabled={isNew}
              >
                Share
              </Button>
            ) : (
              <PopoverTrigger>
                <Button
                  margin={2}
                  size="sm"
                  minW="7em"
                  borderRadius={0}
                  colorScheme="orange"
                  rightIcon={<FaPaperPlane />}
                  isDisabled={isNew}
                >
                  Share
                </Button>
              </PopoverTrigger>
            )}
          </Tooltip>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverBody>
              <div>Share link below 👇</div>
              <br />
              <InputGroup>
                <Input
                  value={shareUrl}
                  ref={shareLinkInputRef}
                  onClick={onShareLinkClick}
                ></Input>
              </InputGroup>
            </PopoverBody>
          </PopoverContent>
        </Popover>
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
          onClick={onSave}
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
