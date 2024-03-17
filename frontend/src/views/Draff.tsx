import React, { useRef, useEffect, useState } from 'react';
import {
  Flex,
  Box,
  Stack,
  Alert,
  AlertTitle,
  AlertDescription,
  Icon,
  Link,
  Hide,
  Show,
} from '@chakra-ui/react';
import { TbGhost2Filled } from 'react-icons/tb';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { Terminal } from '../components/Terminal';
import { Editor } from '../components/Editor';
import { CallbackFn, ConsoleFn, safeEval } from '../util/safeEval';
import {
  MetaSyntox,
  asLogLevel,
  asPlainText,
  syntaxify,
} from '../util/syntaxify';

const defaultLines = [
  ...`       ,"-.
       ||~'    Draff JS REPL v00.3 (incomplete)
    ___||         copyright (c) 2024 draff.io
   ,(.:')
    || ||
    ^^ ^^
    `
    .split('\n')
    .map((line) => syntaxify(asPlainText(line))),
];

const timeouts: Record<number, number> = {};

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

  const onExecute = async (
    code: string,
    clearScope?: boolean,
    voidRun?: boolean,
  ) => {
    if (clearScope) {
      setTermLines([]);
    }
    const logLines: React.JSX.Element[] = [];
    const consoleFn: ConsoleFn = (level: any, args: any[]) => {
      logLines.push(syntaxify(asLogLevel(args[0], level)));
    };
    const callbackFn: CallbackFn = (type, callback, interval) => {
      if (type === 'timeout') {
        setTimeout(() => {
          onExecute(`(${callback})()`, false);
        }, interval);
      }
    };
    const output = await safeEval(code, {
      consoleFn,
      callbackFn,
      clearHistory: clearScope,
    });
    setTermLines([...logLines, syntaxify(output)]);
  };
  const onTermClear = () => setTermLines([]);
  const onTermConsole = (arg: any, level: MetaSyntox['level']) => {
    setTermLines([]);
  };

  return (
    <Stack maxHeight="100vh" overflowY={'scroll'}>
      <Alert status={'warning'} minHeight={'34px'}>
        <Icon as={TbGhost2Filled} boxSize={'52px'} color="yellow.800"></Icon>
        <AlertTitle>NOTHING IS SAVED</AlertTitle>

        <AlertDescription>
          This is a pre-release ("double zero") of{' '}
          <Link href={'#'}>draff.io</Link>. Remember,{' '}
          <b>All data is lost immediately on close or refresh</b>. Thanks for
          visiting ❤️
        </AlertDescription>
      </Alert>
      <Flex
        height="100%"
        maxHeight="100%"
        bg="gray.700"
        margin={{ base: '0', md: '1em' }}
      >
        <Box
          minWidth={{ base: '100%', md: '50%' }}
          height={{ base: '90vh', md: '100%' }}
          bg="yellow.100"
          maxH="100%"
        >
          <Editor onExecute={onExecute} />
        </Box>
        <Hide above="md">
          <Terminal
            lines={termLines}
            onNewLines={onNewTermLines}
            onClear={onTermClear}
            onConsole={onTermConsole}
          />
        </Hide>
        <Show above="md">
          <Terminal
            lines={termLines}
            onNewLines={onNewTermLines}
            onClear={onTermClear}
            onConsole={onTermConsole}
          />
        </Show>
      </Flex>
    </Stack>
  );
};
