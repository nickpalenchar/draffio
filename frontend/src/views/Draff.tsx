import React, { useRef, useEffect, useState } from 'react';
import {
  Flex,
  Center,
  Box,
  Stack,
  Button,
  Alert,
  AlertTitle,
  AlertDialogBody,
  AlertDescription,
  AlertIcon,
  Icon,
  Link,
} from '@chakra-ui/react';
import { TbGhost2Filled } from 'react-icons/tb';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { Terminal } from '../components/Terminal';
import { Editor } from '../components/Editor';
import { ConsoleFn, safeEval } from '../util/safeEval';
import {
  MetaSyntox,
  asLogLevel,
  asPlainText,
  syntaxify,
} from '../util/syntaxify';

const defaultLines = [
  ...`       ,"-.
       ||~'    Draff JS REPL v0.1 (preview)
    ___||         copyright (c) 2024 draff.io
   ,(.:')
    || ||
    ^^ ^^
    `
    .split('\n')
    .map((line) => syntaxify(asPlainText(line))),
];

export const Draff = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [codeEditor, setCodeEditor] = useState<EditorView | null>(null);
  const [termLines, setTermLines] = useState(defaultLines);

  const onNewTermLines = (lines: string[]) =>
    setTermLines([...termLines, ...lines.map((line) => syntaxify(line))]);

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
    const logLines: React.JSX.Element[] = [];
    const consoleFn: ConsoleFn = (level: any, args: any[]) => {
      logLines.push(syntaxify(asLogLevel(args[0], level)));
    };
    const output = await safeEval(code, { consoleFn });
    console.log({ output });
    setTermLines([...logLines, syntaxify(output)]);
  };
  const onTermClear = () => setTermLines([]);
  const onTermConsole = (arg: any, level: MetaSyntox['level']) => {
    setTermLines([]);
  };

  return (
    <Stack maxHeight="100vh" overflowY={'scroll'}>
      <Alert status={'warning'}>
        <Icon as={TbGhost2Filled} boxSize={'52px'} color="yellow.800"></Icon>
        <AlertTitle>NOTHING IS SAVED</AlertTitle>

        <AlertDescription>
          You're viewing an early preview of <Link href={'#'}>draff.io</Link>.
          Remember, <b>All data is lost immediately on close or refresh</b>.
          Thanks for stopping by ❤️
        </AlertDescription>
      </Alert>
      <Center h="5em">Hello</Center>
      <Flex height="100%" maxHeight="100%" bg="gray.700" margin="3em">
        <Box minWidth="50%" bg="yellow.100" maxH="100%">
          <Editor onExecute={onExecute} />
        </Box>
        <Terminal
          lines={termLines}
          onNewLines={onNewTermLines}
          onClear={onTermClear}
          onConsole={onTermConsole}
        />
      </Flex>
    </Stack>
  );
};
