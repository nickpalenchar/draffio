import React, { useState, useRef } from 'react';
import { Box } from '@chakra-ui/react';
import { safeEval } from '../util/safeEval';
import { syntaxify } from '../util/syntaxify';

const terminalStyle: React.CSSProperties = {
  cursor: 'text',
};

const inputStyle: React.CSSProperties = {
  fontWeight: 'bold',
  minWidth: '40px',
  paddingLeft: '2px',
  outline: 'none',
  border: 'none',
  WebkitUserModify: 'read-write-plaintext-only',
  padding: '1px',
  backgroundColor: 'rgba(0,0,0,0)',
};

export const Terminal = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [lines, setLines] = useState<(string | React.JSX.Element)[]>([
    ...`         ,"-.
         ||~'    Draff JS REPL v0.1
      ___||         copyright (c) 2024 draff.io
     ,(.:')
      || ||
      ^^ ^^
      `.split('\n'),
  ]);
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
    const output = syntaxify(await safeEval(input));
    console.log({ output });
    setLines([...lines, '> ' + (input as unknown as string), output]);
  };

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
