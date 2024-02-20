import React, { useState, useEffect, useRef, FC } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { ConsoleFn, EvalResultType, safeEval } from '../util/safeEval';
import { syntaxify } from '../util/syntaxify';

interface TerminalProps {
  lines: any[];
  onSetLines?: (lines: any[]) => void;
  onClear?: () => void;
}

const terminalStyle: React.CSSProperties = {
  cursor: 'text',
};

const inputStyle: React.CSSProperties = {
  fontWeight: 'bold',
  width: '90%',
  paddingLeft: '2px',
  outline: 'none',
  border: 'none',
  WebkitUserModify: 'read-write-plaintext-only',
  padding: '1px',
  backgroundColor: 'rgba(0,0,0,0)',

  WebkitOverflowScrolling: 'touch',
  scrollbarWidth: 'thin',
  scrollbarColor: 'transparent transparent',
  msOverflowStyle: 'none',
  msScrollbarFaceColor: 'transparent', // t
  msScrollbarTrackColor: 'transparent', // track color (Chrome, Safari)
};

const defaultLines = [
  ...`         ,"-.
       ||~'    Draff JS REPL v0.1 (preview)
    ___||         copyright (c) 2024 draff.io
   ,(.:')
    || ||
    ^^ ^^
    `.split('\n'),
];

export const Terminal: FC<TerminalProps> = ({
  lines = defaultLines,
  onSetLines = () => null,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [innerHeight, setInnerHeight] = useState<number | null>(null);
  // const [lines, onSetLines] = useState<(string | React.JSX.Element)[]>();
  const [inputVal, setInputVal] = useState<string>('');

  const handleTerminalClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  const handleOnKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      processLine(event.target.value);
      setInputVal('');
      return;
    }
  };
  const handleOnChange = (event: any) => {
    setInputVal(event.target.value);
  };

  const processLine = async (input: string) => {
    const logLines: any[] = [];
    const consoleFn: ConsoleFn = (level, args) => {
      logLines.push(
        ...args.map((line) =>
          syntaxify({ [EvalResultType]: 'console', level, line }),
        ),
      );
      onSetLines([...lines, ...logLines]);
    };
    const output = syntaxify(await safeEval(input, { consoleFn }));

    console.log({ output });
    if (
      typeof output === 'object' &&
      output.hasOwnProperty(EvalResultType) &&
      'event' in output
    ) {
      if (output.event === 'CLEAR') {
        onSetLines([]);
      } else if (output.event === 'HELP') {
        onSetLines([
          ...lines,
          <Text color="blue.300" fontStyle={'italic'}>
            {'Help Commands:\n  .help - show this\n  .clear - clear the screen'}
          </Text>,
        ]);
      }
    } else {
      onSetLines([
        ...lines,
        '> ' + (input as unknown as string),
        ...logLines,
        output as string,
      ]);
    }
  };

  useEffect(() => {
    setInnerHeight(window.innerHeight);
  }, []);

  return (
    <Box
      paddingLeft="1.2em"
      paddingTop="0.5em"
      paddingRight="1.2em"
      fontFamily={'monospace'}
      fontSize="13px"
      fontWeight={'bold'}
      color="white"
      width="100%"
      style={terminalStyle}
      overflowY={'scroll'}
      maxWidth="100%"
      height={innerHeight ? Math.round(innerHeight * 0.8) + 'px' : '80%'}
      onClick={handleTerminalClick}
    >
      {lines.map((line, i) => (
        <pre key={i.toString()}>{line}</pre>
      ))}
      <div>
        {'>'}{' '}
        <input
          ref={inputRef}
          style={inputStyle}
          value={inputVal}
          onChange={handleOnChange}
          onKeyDown={handleOnKeyDown}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          type="text"
        />
      </div>
    </Box>
  );
};
