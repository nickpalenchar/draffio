import React, { useState, useEffect, useRef, FC } from 'react';
import { Box } from '@chakra-ui/react';
import { ConsoleFn, EvalResultType, safeEval } from '../util/safeEval';
import { MetaSyntox, asLogLevel, asPlainText } from '../util/syntaxify';

interface TerminalProps {
  lines: any[];
  onNewLines?: (lines: string[]) => void;
  onTermClear?: () => void;
  onClear?: () => void;
  onConsole?: (args: any, level: MetaSyntox['level']) => void;
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

export const Terminal: FC<TerminalProps> = ({
  lines,
  onNewLines = () => null,
  onClear = () => {},
  onConsole = () => {},
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [innerHeight, setInnerHeight] = useState<number | null>(null);
  const [inputVal, setInputVal] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIndex, setHistIndex] = useState<number>(-1);

  const handleTerminalClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  const handleOnKeyDown = async (event: any) => {
    if (event.key === 'Enter') {
      await processLine(event.target.value);
      const newHist = [...history, event.target.value];
      setHistory(newHist);
      setHistIndex(newHist.length);
      setInputVal('');
      return;
    }
    if (event.key === 'ArrowUp') {
      const nextHist = histIndex - 1;
      if (nextHist < 0) {
        return;
      }
      setHistIndex(nextHist);
      setInputVal(history[nextHist]);

      inputRef &&
        inputRef.current?.setSelectionRange(
          history[nextHist].length,
          history[nextHist].length,
        );
    }
    if (event.key === 'ArrowDown') {
      const nextHist = histIndex + 1;
      if (nextHist >= history.length) {
        return;
      }
      setHistIndex(nextHist);
      setInputVal(history[nextHist]);
      inputRef &&
        inputRef.current?.setSelectionRange(inputVal.length, inputVal.length);
    }
  };
  const handleOnChange = (event: any) => {
    setInputVal(event.target.value);
  };

  const processLine = async (input: string) => {
    const logLines: any[] = [];
    const consoleFn: ConsoleFn = (level, args) => {
      logLines.push(asLogLevel(args[0], level));
    };
    const output = await safeEval(input, { consoleFn });
    if (
      typeof output === 'object' &&
      output !== null &&
      output.hasOwnProperty(EvalResultType) &&
      'event' in output
    ) {
      if (output.event === 'CLEAR') {
        onClear();
      } else if (output.event === 'HELP' || false) {
        // TODO
      }
    } else {
      onNewLines([asPlainText('> ' + input), ...logLines, output]);
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
      height={{
        base: '20vh',
        md: innerHeight ? Math.round(innerHeight * 0.8) + 'px' : '80%',
      }}
      onClick={handleTerminalClick}
    >
      {lines.map((line, i) => (
        <pre key={i.toString() + line.className}>{line}</pre>
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
