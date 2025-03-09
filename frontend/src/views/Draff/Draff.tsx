import {
  Box,
  Code,
  Flex,
  Highlight,
  Image,
  Text,
  Tooltip,
  Button,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { javascript } from '@codemirror/lang-javascript';
import { Prec } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { EditorView, basicSetup } from 'codemirror';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigation, useParams } from 'react-router-dom';
import { generateCodeLoad } from '../../api/_codeLoadSequence';
import { useGetCode } from '../../api/useGetCode';
import { useSaveCode } from '../../api/useSaveCode';
import { Editor } from '../../components/Editor';
import { Terminal } from '../../components/Terminal';
import { CallbackFn, ConsoleFn, safeEval } from '../../util/safeEval';
import {
  MetaSyntox,
  asLogLevel,
  asPlainText,
  syntaxify,
} from '../../util/syntaxify';
import { DraffNotFoundError } from './DraffNotFoundError';
import { EditorButtons } from './EditorButtons';
import { TerminalButtons } from './TerminalButtons';
import { useAuth0 } from '@auth0/auth0-react';

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
  const [username, setUsername] = useState(params.username ?? 'dev/null');
  const [title, setTitle] = useState(params.title ?? 'untitled');
  const [shareUrl, setShareUrl] = useState(window.location.href);

  // Save button
  const [isSaving, setIsSaving] = useState(false);
  const { saveCode, loading } = useSaveCode();

  const prefix = username.startsWith('@') ? '' : '/';

  const { code, error } = useGetCode({
    username,
    title,
  });

  const { 
    user,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    error: authError,
    getAccessTokenSilently,
    logout,
  } = useAuth0();
  
  // Log authentication state
  useEffect(() => {
    if (isLoading) {
      console.log('Checking authentication status...');
    } else if (authError) {
      console.error('Auth error:', authError);
    } else if (isAuthenticated && user) {
      console.log('User is authenticated:', user);
    } else {
      console.log('User is not authenticated (anonymous)');
    }
  }, [isAuthenticated, isLoading, user, authError]);

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
    if (!editor || loading) {
      console.log('no editor!');
      return;
    }
    
    try {
      setIsSaving(true);
      const existingDraff = username !== 'dev/null' ? { username, title } : undefined;
      
      const { username: newUsername, draffName: newTitle } = await saveCode({
        code: editor.state.doc.toString(),
        existingDraff
      });

      // Update URL and state with d/ prefix
      const newUrl = `/d/${newUsername}/${newTitle}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
      setShareUrl(`${window.location.origin}${newUrl}`);
      setUsername(newUsername);
      setTitle(newTitle);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Example of using the token for API calls
  const callSecureApi = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('your-api-endpoint', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // ... handle response
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box maxHeight="100vh" bgColor="yellow.50">
      <Flex
        bgColor={'orange.200'}
        borderBottomColor="orange.300"
        borderBottomWidth="1px"
        verticalAlign={'center'}
        maxH="4em"
        justifyContent="space-between"
        alignItems="center"
      >
        <Flex alignItems="center">
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
              {prefix + username}
            </Text>
            <Text as="span" fontWeight={'bold'} color="yellow.800">
              /{title}
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
        
        {isAuthenticated ? (
          <Menu>
            <MenuButton>
              <Avatar
                src={user?.picture}
                size="sm"
                mr={4}
                cursor="pointer"
                borderRadius="full"
                border="2px solid"
                borderColor="orange.300"
                width="32px"
                height="32px"
              />
            </MenuButton>
            <MenuList
              bg="yellow.50"
              borderColor="orange.300"
              boxShadow="md"
            >
              <MenuItem
                py={3}
                px={4}
                _hover={{ bg: 'yellow.100' }}
              >
                <Box>
                  <Text fontWeight="bold" color="orange.600">
                    {user?.email}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {user?.nickname || 'Anonymous Giraffe'}
                  </Text>
                </Box>
              </MenuItem>
              <MenuItem
                onClick={() => logout({ 
                  logoutParams: {
                    returnTo: window.location.origin
                  }
                })}
                py={2}
                px={4}
                _hover={{ bg: 'yellow.100' }}
                color="orange.600"
              >
                Log Out
              </MenuItem>
            </MenuList>
          </Menu>
        ) : (
          <Button
            onClick={() => loginWithRedirect()}
            bgColor="orange.600"
            color="white"
            _hover={{ bgColor: 'orange.700' }}
            mr={4}
            h="32px"
            borderRadius="0"
            fontSize="14px"
          >
            Log In
          </Button>
        )}
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
            isSaving={isSaving}
            shareUrl={shareUrl}
            disable={loading || !!error || !isAuthenticated}
            disableReason={!isAuthenticated ? "Login first" : undefined}
            isAuthenticated={isAuthenticated}
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
