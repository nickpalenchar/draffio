import React, { useState, ChangeEvent } from 'react';
import { Box, Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { safeEval } from '../util/safeEval';

const terminalStyle: React.CSSProperties = {
  cursor: 'text',
};

const inputStyle: React.CSSProperties = {
  fontWeight: 'bold',
  minWidth: '40px',
  paddingLeft: '2px',
  outline: 'none',
  border: 'none',
  WebkitUserModify: 'read-write-plaintext-only', // For Safari
  /* Add your custom styling properties here */
  padding: '1px',
  backgroundColor: 'rgba(0,0,0,0)',
  // border: '1px solid #ccc',
};

export const Terminal = () => {
  const [lines, setLines] = useState<string[]>([
    'Draff JS v0.1',
    '   "Hello everyone!"',
  ]);
  const [inputVal, setInputVal] = useState<string>('');

  const handleOnKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      console.log('goti t', event.target.value);
      processLine(event.target.value);
      setInputVal('');
      return;
    }
  };
  const handleOnChange = (event: any) => {
    setInputVal(event.target.value);
  };

  const processLine = (input: string) => {
    const output = safeEval(input);
    setLines([...lines, '> ' + input, output]);
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
      style={terminalStyle}
    >
      {lines.map((line, i) => (
        <div key={i.toString()}>{line}</div>
      ))}
      <div>
        {'>'}{' '}
        <input
          style={inputStyle}
          value={inputVal}
          onChange={handleOnChange}
          onKeyDown={handleOnKeyDown}
        />
      </div>
    </Box>
  );
};
