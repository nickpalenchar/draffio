import React, { useRef, useEffect, useState } from 'react';
import {
  Flex,
  Box,
  Text,
  Image,
  Code,
  Container,
  Highlight,
} from '@chakra-ui/react';
import { Terminal } from '../../components/Terminal';
import { Editor } from '../../components/Editor';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { keymap } from '@codemirror/view';
import { Prec } from '@codemirror/state';
import { CallbackFn, ConsoleFn, safeEval } from '../../util/safeEval';
import {
  MetaSyntox,
  asLogLevel,
  asPlainText,
  syntaxify,
} from '../../util/syntaxify';
import { Tooltip } from '@chakra-ui/react';
import { EditorButtons } from './EditorButtons';
import { TerminalButtons } from './TerminalButtons';
import { useNavigation, useParams } from 'react-router-dom';
import { useGetCode } from '../../api/useGetCode';
import { generateCodeLoad } from '../../api/_codeLoadSequence';
import { DraffNotFoundError } from './DraffNotFoundError';

const defaultLines = [
  ...`       ,"-.
       ||~'    Draff JS REPL v00.7 (incomplete)
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
  const params = useParams();
  const navigation = useNavigation();

  const username = params.username ?? 'dev/null';
  const codeFile = params.codeFile ?? 'untitled';

  const { code, error, loading } = useGetCode({ username, codeFile });
  console.log('GOT CODE?', code);

  useEffect(() => {
    if (!code || !editorRef?.current || editor || error) {
      return;
    }
    const editorView = new EditorView({
      doc: '',
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
  }, [editorRef, error]);

  useEffect(() => {
    if (!editor || error) {
      return;
    }
    let interval: ReturnType<typeof setInterval>;
    let weight = 1000;
    if (loading) {
      interval = setInterval(
        () =>
          editor.dispatch({
            changes: {
              from: 0,
              to: editor.state.doc.length,
              insert: generateCodeLoad(weight),
            },
          }),
        100,
      );
    }
    return () => {
      clearInterval(interval);
    };
  }, [loading, editor]);

  useEffect(() => {
    if (!editor || !code) {
      return;
    }
    editor.dispatch({
      changes: {
        from: 0,
        to: editor.state.doc.length,
        insert: code,
      },
    });
  }, [editor, code]);

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
    if (!editor || loading) {
      return null;
    }
    const code = editor.state.doc.toString();
    onExecute(code, true);
  };
  const onSave = async () => {
    console.log('wip save');
  };

  return (
    <Box maxHeight="100vh" bgColor="yellow.50">
      <Flex
        bgColor={'orange.200'}
        borderBottomColor="orange.300"
        borderBottomWidth="1px"
        verticalAlign={'center'}
        maxH="4em"
      >
        <Tooltip label="Giraffe icons created by Freepik - Flaticon">
          <Image
            src={process.env.PUBLIC_URL + '/draff-logo.webp'}
            height="2.8em"
            marginTop={2}
            marginLeft="1em"
          />
        </Tooltip>
        <Code background="transparent" p={4} fontSize="17px">
          <Text as="span" color="orange.600" fontWeight={'bold'}>
            {username}
          </Text>
          <Text as="span" fontWeight={'bold'} color="yellow.800">
            /{codeFile}
          </Text>
        </Code>
        <Box p={4} paddingLeft={0} fontSize="17px">
          {error === 'Not Found!' && (
            <Text as="span" color="white">
              <Highlight
                query="404"
                styles={{
                  px: '2',
                  py: '1',
                  rounded: 'full',
                  bg: 'red.600',
                  color: 'gray.100',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                }}
              >
                404
              </Highlight>
            </Text>
          )}
        </Box>
      </Flex>

      {/* DRAFF BODY */}
      <Flex
        height="100%"
        maxHeight="100%"
        bg="gray.700"
        margin={{ base: '0', md: '0 1em' }}
        marginTop="0"
        direction={{ base: 'column', md: 'row' }}
      >
        <Flex
          direction="column"
          minWidth={{ base: '100%', md: '50%' }}
          bg="yellow.100"
        >
          <EditorButtons
            onRun={onRun}
            onSave={onSave}
            disable={loading || !!error}
          />
          <Box bg="yellow.100" maxH={{ base: '60vh', md: '100%' }}>
            {error === 'Not Found!' && <DraffNotFoundError />}

            {!error && <Editor editorRef={editorRef} />}
          </Box>
        </Flex>
        <Flex
          direction="column"
          minWidth={{ base: '100%', md: '50%' }}
          bgColor="gray.700"
        >
          <TerminalButtons onClear={onTermClear} />
          <Terminal
            lines={termLines}
            onNewLines={onNewTermLines}
            onClear={onTermClear}
            onConsole={onTermConsole}
          />
        </Flex>
      </Flex>
    </Box>
  );
};
