import React, { FC, useEffect, useRef, useState } from 'react';
import { Box, Button, Center, Hide, Spacer, VStack } from '@chakra-ui/react';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { keymap } from '@codemirror/view';
import { Prec } from '@codemirror/state';
interface EditorParams {
  editor?: EditorView | null;
  editorRef?: React.RefObject<HTMLDivElement>;
  onExecute: (code: string, clearScope?: boolean) => void;
}

export const Editor: FC<EditorParams> = ({ onExecute, editorRef, editor }) => {
  const [codeEditor, setCodeEditor] = useState<EditorView | null>(null);

  useEffect(() => {
    if (!editor) {
      return;
    }
    (window as any).editor = editor;
    setCodeEditor(editor);

    // cleanup
    return () => editor.destroy();
  }, [editor]);

  const onRun = () => {
    if (!codeEditor) {
      return null;
    }

    const code = codeEditor.state.doc.toString();
    onExecute(code, true);
  };

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
      <Hide below="md">
        <Spacer />
      </Hide>
      <Box height="100%">
        <Center minWidth="48px">
          <Button colorScheme="green" onClick={onRun}>
            Run
          </Button>
        </Center>
        <Spacer></Spacer>
      </Box>
    </VStack>
  );
};
