/** Parses strings that should be code (or code output) into react nodes meant
 * to be rendered. The use case is adding some UI to Terminal compnent.
 */
import React from 'react';
import { Tag, TagLabel, TagRightIcon, Text } from '@chakra-ui/react';

import { EvalResultType, SafeEvalResult } from './safeEval';
import { InfoIcon } from '@chakra-ui/icons';

const Meta = ({ children }: { children: any }) => (
  <Text as="span" color="gray.400" fontWeight={'400'} fontStyle={'italic'}>
    {children}
  </Text>
);

export const syntaxify = (
  input: any | SafeEvalResult,
  { color }: { color?: string } = {},
):
  | string
  | React.JSX.Element
  | { [EvalResultType]: 'event'; event: string } => {
  console.log('parsing input', input);
  if (input === undefined) {
    return <Meta>undefined</Meta>;
  }
  if (input === null) {
    return <Meta>null</Meta>;
  }
  if (typeof input === 'string') {
    return (
      <Text
        className="syntax-string"
        as="span"
        color={color || 'yellow.200'}
      >{`"${input.replace('"', '\\"')}"`}</Text>
    );
  }
  if (typeof input === 'number') {
    return (
      <Text className="syntax-number" as="span" color={color || 'blue.200'}>
        {input}
      </Text>
    );
  }
  if (typeof input === 'boolean') {
    return (
      <Text className="syntax-boolean" as="span" color={color || 'green.300'}>
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
            <Text as="span">
              {syntaxify(out, { color }) as string | React.JSX.Element}
            </Text>
            {i < arr.length - 1 && ', '}
          </>
        ))}
        ]
      </Text>
    );
  }
  if (input instanceof Date) {
    return (
      <Text as="span" className="syntax-date">
        <Meta>[Date] </Meta>
        {input.toJSON()}
      </Text>
    );
  }

  // parsing from postMessage
  if (EvalResultType in input) {
    if (input[EvalResultType] === 'result') {
      return syntaxify(input.result, { color });
    }
    if (input[EvalResultType] === 'error') {
      return <Text color={'red'}>{input.error}</Text>;
    }
    if (input[EvalResultType] === 'event') {
      // gets handled further up the callstack.
      return input;
    }
    if (input[EvalResultType] === 'console') {
      return (
        <Text className="syntax-console" as="span">
          <Tag
            size="xs"
            paddingRight="4px"
            marginRight="8px"
            marginBottom="-10px"
            backgroundColor="gray.500"
          >
            <TagRightIcon>
              <InfoIcon color="gray.700" marginRight="4px" />
            </TagRightIcon>
            <TagLabel>log</TagLabel>
          </Tag>
          <Meta>{syntaxify(input.line, { color: 'gray.300' }) as string}</Meta>
        </Text>
      );
    }
  }

  // TODO object
  if (input instanceof Object) {
    return (
      <Text as="span" className="syntax-object">
        {'{ '}
        {Object.entries(input).map(([key, value], i, arr) => {
          return (
            <>
              <Text as="span" className="syntax-object-key">
                {key}:{' '}
              </Text>
              <Text as="span" className="syntax-object-value">
                {syntaxify(value, { color }) as string | React.JSX.Element}
                {i < arr.length - 1 && ', '}
              </Text>
            </>
          );
        })}
        {' }'}
      </Text>
    );
  }
  return (
    <Text as="span" className="syntax-unknown">
      {input.toString()}
    </Text>
  );
};
