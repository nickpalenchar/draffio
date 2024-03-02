/** Parses strings that should be code (or code output) into react nodes meant
 * to be rendered. The use case is adding some UI to Terminal compnent.
 */
import React from 'react';
import { PiFunctionFill } from 'react-icons/pi';
import { Icon, Tag, TagLabel, TagRightIcon, Text } from '@chakra-ui/react';
import { IoFlagSharp } from 'react-icons/io5';

import { EvalResultType, SafeEvalResult } from './safeEval';
import { IoGift } from 'react-icons/io5';
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
  if (typeof input === 'object' && input !== null && input[MetaType]) {
    return { [MetaType]: 'console', [MetaValue]: input[MetaValue], level };
  }
  return { [MetaType]: 'console', [MetaValue]: input, level };
};

export const syntaxify = (
  input: any,
  { color, showIcon = true }: { color?: string; showIcon?: boolean } = {},
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
      const [tagColor, icon] = levels[input.level as 'log'];
      const Syntax = () => syntaxify(input[MetaValue], { color: 'grey.200' });
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
          <Meta>
            <Syntax />
          </Meta>
        </Text>
      );
    }

    /// primitives ///
    if (input?.type === 'result-string') {
      return (
        <Text
          className="syntax-string"
          as="span"
          color={color || 'yellow.200'}
        >{`"${input.result.replace('"', '\\"')}"`}</Text>
      );
    }
    if (input?.type === 'result-number') {
      return (
        <Text className="syntax-number" as="span" color={color || 'blue.200'}>
          {input.result}
        </Text>
      );
    }
    if (input.type === 'result-boolean') {
      return (
        <Text className="syntax-boolean" as="span" color={color || 'green.300'}>
          {input.result.toString()}
        </Text>
      );
    }
    if (input.type === 'result-null') {
      return <Meta>null</Meta>;
    }
    if (input.type === 'result-undefined') {
      return <Meta>undefined</Meta>;
    }

    /// complex types
    if (input.type === 'result-symbol') {
      return (
        <Text color="teal.200" as="span" className="syntax-symbol">
          {showIcon && <Icon as={IoFlagSharp} marginBottom="-4px" />}
          {input.result}
        </Text>
      );
    }
    if (input.type === 'result-function') {
      return (
        <Text color={'purple.300'} as="span" className="syntax-function">
          [
          {showIcon && (
            <>
              <Icon
                as={PiFunctionFill}
                boxSize={4}
                marginBottom={'-3px'}
              ></Icon>
              <span> </span>
            </>
          )}
          Function: {input.result.name}]
        </Text>
      );
    }
    if (input.type === 'result-date') {
      return (
        <Text as="span" className="syntax-date">
          <Meta>[Date] </Meta>
          {input.result}
        </Text>
      );
    }
    if (input.type === 'result-promise') {
      const statusColorsMap = {
        Resolved: 'lime',
        Rejected: 'red',
        Pending: 'yellow',
        Settled: 'grey',
      };
      const COLOR = 'pink.200';
      return (
        <Text as="span" className="syntax-promise">
          <Text as="span" color={COLOR}>
            [<Icon as={IoGift} boxSize={4} marginBottom="-3px" /> Promise{' '}
          </Text>
          <Text
            color={statusColorsMap[input.result.state as 'Resolved']}
            as="span"
          >
            ({input.result.state.toLowerCase()}){' '}
          </Text>
          <Text as="span" color={COLOR}>
            value:{' '}
          </Text>
          {syntaxify(input.result.value)}
          <Text as="span" color={COLOR}>
            {' '}
            ]
          </Text>
        </Text>
      );
    }
    if (input.type === 'result-array') {
      return (
        <Text as="span" className="syntax-array">
          [
          {input.result.map((out: any, i: number, arr: Array<any>) => (
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
    if (input.type === 'result-object') {
      console.log('got to relut ab', input);
      return (
        <Text as="span" className="syntax-object">
          {'{ '}
          {input.result.map((entry: any, i: number, arr: Array<any>) => {
            console.log('MAPPING', entry);
            return (
              <>
                <Text as="span" className="syntax-object-key">
                  {entry.key.keyType === 'symbol' ? (
                    <>
                      [
                      <Text as="span" color="teal.200">
                        {entry.key.keyValue}
                      </Text>
                      ]
                    </>
                  ) : (
                    entry.key.keyValue
                  )}
                  :{' '}
                </Text>
                <Text as="span" className="syntax-object-value">
                  {syntaxify(entry.value)}
                  {i < arr.length - 1 && ', '}
                </Text>
              </>
            );
          })}
          {' }'}
        </Text>
      );
    }
  } catch (e) {
    // noop
  }

  // native types that need to be reconstructed (can't be cloned from worker)

  if (input instanceof Error) {
    return (
      <Text color={'red'} as="span" className="syntax-error">
        {input.toString()}
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

  return (
    <Text as="span" className="syntax-unknown">
      {input.toString()}
    </Text>
  );
};
