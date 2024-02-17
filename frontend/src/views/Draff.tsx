import React, { useRef, useEffect, useState } from 'react';
import { Flex, Center, Box, Stack } from '@chakra-ui/react';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { gutter } from '@codemirror/gutter';

export const Draff = () => {
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
    setCodeEditor(editor);

    // cleanup
    return () => editor.destroy();
  }, []);

  return (
    <Stack h="100vh">
      <Center h="5em">Hello</Center>
      <Flex height="100%" bg="teal.800" margin="3em">
        <Box minWidth="50%" bg="teal.50" ref={editorRef}>
          <Box margin={'1.5em'} ref={editorRef} />
        </Box>
        <Box
          paddingLeft="1.2em"
          paddingTop="0.5em"
          paddingRight="1.2em"
          fontFamily={'monospace'}
          fontWeight={'bold'}
          color="white"
        >
          textedit 2
        </Box>
      </Flex>
    </Stack>
  );
};
