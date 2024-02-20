import React, { useRef, useEffect, useState } from 'react';
import { Flex, Center, Box, Stack, Button } from '@chakra-ui/react';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { Terminal } from '../components/Terminal';

const defaultLines = [
  ...`     ,"-.
       ||~'    Draff JS REPL v0.1 (preview)
    ___||         copyright (c) 2024 draff.io
   ,(.:')
    || ||
    ^^ ^^
    `.split('\n'),
];

export const Draff = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [codeEditor, setCodeEditor] = useState<EditorView | null>(null);
  const [termLines, setTermLines] = useState(defaultLines);

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
      <Center>
        <Button>Run Code</Button>
      </Center>
      <Flex height="100%" maxHeight="100%" bg="gray.700" margin="3em">
        <Box minWidth="50%" bg="yellow.50" ref={editorRef}>
          <Box margin={'1.5em'} ref={editorRef} />
        </Box>
        <Terminal lines={termLines} onSetLines={onSetTermLines} />
      </Flex>
    </Stack>
  );
};
