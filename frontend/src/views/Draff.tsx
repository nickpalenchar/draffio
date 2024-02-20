import React, { useRef, useEffect, useState } from 'react';
import { Flex, Center, Box, Stack } from '@chakra-ui/react';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { Terminal } from '../components/Terminal';

export const Draff = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [codeEditor, setCodeEditor] = useState<EditorView | null>(null);
  const [termLines, setTermLines] = useState(['hello wolrd']);

  const onSetTermLines = (lines: string[]) => setTermLines(lines);

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
      <Flex height="100%" maxHeight="100%" bg="gray.700" margin="3em">
        <Box minWidth="50%" bg="yellow.50" ref={editorRef}>
          <Box margin={'1.5em'} ref={editorRef} />
        </Box>
        <Terminal lines={termLines} onSetLines={onSetTermLines} />
      </Flex>
    </Stack>
  );
};
