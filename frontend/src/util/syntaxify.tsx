/** Parses strings that should be code (or code output) into react nodes meant
 * to be rendered. The use case is adding some UI to Terminal compnent.
 */
import React from 'react';
import { PiFunctionFill } from 'react-icons/pi';
import { Icon, Tag, TagLabel, TagRightIcon, Text } from '@chakra-ui/react';

import { EvalResultType, SafeEvalResult } from './safeEval';
import { InfoIcon, WarningIcon, WarningTwoIcon } from '@chakra-ui/icons';

const Meta = ({ children }: { children: any }) => (
  <Text as="span" color="gray.400" fontWeight={'400'} fontStyle={'italic'}>
    {children}
  </Text>
);

const MetaValue = Symbol();
const MetaType = Symbol();

export type MetaSyntox = {
  [MetaType]: string;
  [MetaValue]: any;
  level?: 'log' | 'warn' | 'error';
};

export const asPlainText = (input: any) => {
  if (typeof input === 'object' && input !== null && input[MetaType]) {
    return { [MetaType]: 'plaintext', [MetaValue]: input[MetaValue] };
  }
  return { [MetaType]: 'plaintext', [MetaValue]: input.toString() };
};
export const asLogLevel = (input: any, level: MetaSyntox['level'] = 'log') => {
  console.log('asConsole', { input, level });
  if (typeof input === 'object' && input !== null && input[MetaType]) {
    return { [MetaType]: 'console', [MetaValue]: input[MetaValue], level };
  }
  return { [MetaType]: 'console', [MetaValue]: input, level };
};

export const syntaxify = (
  input: any,
  { color }: { color?: string } = {},
): React.JSX.Element => {
  console.log('parsing input', input);

  // special syntax
  try {
    if (input?.[MetaType] === 'plaintext') {
      return (
        <Text as="span" className="syntax-plaintext">
          {input[MetaValue]}
        </Text>
      );
    }
    if (input?.[MetaType] === 'console') {
      const levels = {
        log: ['gray.500', <InfoIcon color="gray.700" marginRight="4px" />],
        warn: [
          'yellow.500',
          <WarningTwoIcon color="yellow.700" marginRight="4px" />,
        ],
        error: ['red.500', <WarningIcon color="red.900" marginRight="4px" />],
      };
      console.log(levels[input.level as 'log']);
      const [tagColor, icon] = levels[input.level as 'log'];
      return (
        <Text className="syntax-console" as="span">
          <Tag
            size="xs"
            paddingRight="4px"
            marginRight="8px"
            marginBottom="-10px"
            backgroundColor={tagColor as string}
          >
            <TagRightIcon>{icon}</TagRightIcon>
            <TagLabel>log</TagLabel>
          </Tag>
          <Meta>{syntaxify(input[MetaValue], { color: 'gray.300' })}</Meta>
        </Text>
      );
    }
  } catch (e) {
    // noop
  }

  // native types that need to be reconstructed (can't be cloned from worker)
  if (typeof input === 'object' && input?.[EvalResultType] === 'function') {
    return (
      <Text color={'purple.300'} as="span" className="syntax-function">
        [<Icon as={PiFunctionFill} boxSize={4} marginBottom={'-3px'}></Icon>{' '}
        Function: {input.name}]
      </Text>
    );
  }
  if (input instanceof Error) {
    return (
      <Text color={'red'} as="span" className="syntax-error">
        {input.toString()}
      </Text>
    );
  }

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
  try {
    if (EvalResultType in input) {
      if (input[EvalResultType] === 'result') {
        return syntaxify(input.result, { color });
      }
      if (input[EvalResultType] === 'event') {
        // gets handled further up the callstack.
        return input;
      }
    }
  } catch (e) {
    //noop
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
