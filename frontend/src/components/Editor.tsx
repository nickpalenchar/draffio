import React, { FC, useEffect, useRef, useState } from 'react';
import { Box, Button, Center, Flex, Spacer, VStack } from '@chakra-ui/react';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';

interface EditorParams {
  onExecute: (code: string, clearScope?: boolean) => void;
}

export const Editor: FC<EditorParams> = ({ onExecute }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [codeEditor, setCodeEditor] = useState<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current || codeEditor) {
      return;
    }
    const editor = new EditorView({
      doc: '// Your code here',
      extensions: [basicSetup, javascript()],
      parent: editorRef.current,
    });
    editor.dom.addEventListener('keydown', (e: any) => {
      console.log('hello??');
      e.preventDefault();
    });
    (window as any).editor = editor;
    setCodeEditor(editor);

    // cleanup
    return () => editor.destroy();
  }, []);

  const onRun = () => {
    if (!codeEditor) {
      return null;
    }

    const code = codeEditor.state.doc.toString();
    onExecute(code, true);
  };

  const onKeyDown = (e: any) => {
    if (!e.ctrlKey && e.metaKey && e.key === 'Enter') {
      console.log('execute!');
      e.preventDefault();
    }
  };

  return (
    <VStack>
      <Box
        width="100%"
        height="640px"
        maxHeight="100%"
        overflowY={'scroll'}
        overflowX={'hidden'}
      >
        <Box background="yellow.50">
          {' '}
          <Box
            maxHeight="100%"
            width="100%"
            ref={editorRef}
            onKeyDown={onKeyDown}
          />
        </Box>
      </Box>
      <Spacer />
      <Box height="100%">
        <Center minWidth="48px">
          <Button colorScheme="green" onClick={onRun}>
            Run
          </Button>
        </Center>
      </Box>
    </VStack>
  );
};
