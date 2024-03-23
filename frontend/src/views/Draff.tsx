import React, { useRef, useEffect, useState } from 'react';
import { Flex, Box, Stack, Icon, Text, Button } from '@chakra-ui/react';
import { HiMiniPlay } from 'react-icons/hi2';
import { Terminal } from '../components/Terminal';
import { Editor } from '../components/Editor';
import { FaSave } from 'react-icons/fa';
import { EditorView, basicSetup } from 'codemirror';
import { FaPaperPlane } from 'react-icons/fa';
import { javascript } from '@codemirror/lang-javascript';
import { keymap } from '@codemirror/view';
import { Prec } from '@codemirror/state';
import { CallbackFn, ConsoleFn, safeEval } from '../util/safeEval';
import {
  MetaSyntox,
  asLogLevel,
  asPlainText,
  syntaxify,
} from '../util/syntaxify';
import { Tooltip } from '@chakra-ui/react';

const defaultLines = [
  ...`       ,"-.
       ||~'    Draff JS REPL v00.6 (incomplete)
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
  const [termLines, setTermLines] = useState(defaultLines);
  const [editor, setEditor] = useState<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef?.current || editor) {
      return;
    }
    const editorView = new EditorView({
      doc: '// Your code here',
      extensions: [
        basicSetup,
        javascript(),
        Prec.highest(
          keymap.of([
            {
              key: 'Ctrl-Enter',
              mac: 'Cmd-Enter',
              run: (view) => {
                const code = view.state.doc.toString();
                onExecute(code, true);
                return true;
              },
            },
          ]),
        ),
      ],
      parent: editorRef.current,
    });
    setEditor(editorView);
    return () => editorView.destroy();
  }, [editorRef]);

  const onNewTermLines = (lines: string[]) =>
    setTermLines([...termLines, ...lines.map((line) => syntaxify(line))]);

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

  const onRun = () => {
    if (!editor) {
      return null;
    }
    const code = editor.state.doc.toString();
    onExecute(code, true);
  };

  return (
    <Stack maxHeight="100vh" overflowY={'scroll'}>
      <Flex p={4} bgColor={'orange.200'} verticalAlign={'center'}>
        <code>
          <Text as="span" color="orange.600" fontWeight={'bold'}>
            /dev/null
          </Text>
          <Text as="span" fontWeight={'bold'} color="yellow.800">
            /untitled
          </Text>
        </code>
      </Flex>
      <Flex
        height="100%"
        maxHeight="100%"
        bg="gray.700"
        margin={{ base: '0', md: '1em' }}
        marginTop="0"
        direction={{ base: 'column', md: 'row' }}
      >
        <Flex
          direction="column"
          minWidth={{ base: '100%', md: '50%' }}
          bg="yellow.100"
        >
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
              isDisabled={true}
              rightIcon={<FaSave />}
            >
              Save
            </Button>
            <Button
              margin={2}
              size="sm"
              minW="7em"
              borderRadius={0}
              colorScheme={'teal'}
              onClick={onRun}
            >
              Run <Icon as={HiMiniPlay} marginLeft={1} />
            </Button>
          </Flex>
          <Box bg="yellow.100" maxH={{ base: '60vh', md: '100%' }}>
            <Editor editorRef={editorRef} />
          </Box>
        </Flex>
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
