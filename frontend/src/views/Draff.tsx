import React, { useRef, useEffect, useState } from 'react';
import { Flex, Center, Box, Stack, Button } from '@chakra-ui/react';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { Terminal } from '../components/Terminal';
import { Editor } from '../components/Editor';
import { EvalResultType, safeEval } from '../util/safeEval';
import { syntaxify } from '../util/syntaxify';

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

  const onExecute = async (code: string) => {
    setTermLines([]);
    const output = await safeEval(code);
    if (output[EvalResultType] === 'result') {
      setTermLines([output.result]);
    }
    console.log({ output });
    // setTermLines([output]);
  };

  return (
    <Stack maxHeight="100vh" overflowY={'scroll'}>
      <Center h="5em">Hello</Center>
      <Flex height="100%" maxHeight="100%" bg="gray.700" margin="3em">
        <Box minWidth="50%" bg="yellow.50" maxH="100%">
          <Editor onExecute={onExecute} />
        </Box>
        <Terminal lines={termLines} onSetLines={onSetTermLines} />
      </Flex>
    </Stack>
  );
};
