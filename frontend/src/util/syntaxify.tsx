/** Parses strings that should be code (or code output) into react nodes meant
 * to be rendered. The use case is adding some UI to Terminal compnent.
 */
import React from 'react';
import { Text } from '@chakra-ui/react';

import { SafeEvalResult } from './safeEval';

export const syntaxify = (
  input: any | SafeEvalResult,
): string | React.JSX.Element => {
  if (typeof input === 'string') {
    return (
      <Text
        className="syntax-string"
        as="span"
        color="yellow.200"
      >{`"${input.replace('"', '\\"')}"`}</Text>
    );
  }
  if (typeof input === 'number') {
    return (
      <Text className="syntax-number" as="span" color="blue.200">
        {input}
      </Text>
    );
  }
  if (typeof input === 'boolean') {
    return (
      <Text className="syntax-boolean" as="span" color="green.300">
        {input.toString()}
      </Text>
    );
  }
  if (Array.isArray(input)) {
    return (
      <Text as="span" className="syntax-array">
        [
        {input.map((out, i, arr) => (
          <>
            <Text as="span">{syntaxify(out)}</Text>
            {i < arr.length - 1 && ', '}
          </>
        ))}
        ]
      </Text>
    );
  }
  if (input.type === 'result') {
    return syntaxify(input.result);
  }
  if (input.type === 'error') {
    return <Text color={'red'}>{input.error}</Text>;
  }
  // TODO object
  return 'unknown';
};
