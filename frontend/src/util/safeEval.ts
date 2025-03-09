export const EvalResultType = Symbol('EvalResultType');

export type SafeEvalResult =
  | { [EvalResultType]: 'result'; result: string }
  | { [EvalResultType]: 'error'; error: string }
  | { [EvalResultType]: 'event'; event: 'CLEAR' | 'HELP' };
export class BlockedBySandbox extends Error {
  constructor() {
    super();
    this.name = 'BlockedBySandbox';
    this.message = 'Action blocked';
  }
}
type ConsoleLevels = 'log' | 'warn' | 'error';
export type ConsoleFn = (level: ConsoleLevels, args: any[]) => void;
export type CallbackFn = (
  type: 'timeout' | 'interval' | 'clear',
  callback: string,
  interval: number,
) => void;
interface SafeEvalOptions {
  consoleFn?: ConsoleFn;
  callbackFn?: CallbackFn;
  clearHistory?: boolean;
}

let scope: string[] = [];

const _safeWrap = (input: string) => {
  if (input.trim().startsWith('{') && input.trim().endsWith('}')) {
    return `(${input})`;
  }
  return input;
};

const worker = new Worker('/worker.js');

export const safeEval = async (
  input: string,
  { consoleFn, callbackFn, clearHistory = false }: SafeEvalOptions = {},
): Promise<any> => {
  console.log('calling', { input });

  if (clearHistory) {
    scope = [];
  }

  const executeCodeInWorker = (
    code: string,
    { consoleFn }: SafeEvalOptions = {},
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      // Handle messages from the worker
      worker.onmessage = (event) => {
        const message = event.data;
        if (message.type === 'console') {
          return consoleFn?.(message.level, message.console);
        }
        if (message.type === 'callback') {
          if (callbackFn) {
          }
          return callbackFn?.(
            message.callbackType,
            message.functionData,
            message.timeout,
          );
        }
        /// new stuFF
        const migrated = [
          'result-string',
          'result-promise',
          'result-number',
          'result-boolean',
          'result-null',
          'result-undefined',
          'result-symbol',
          'result-function',
          'result-array',
          'result-object',
          'result-date',
        ];
        if (migrated.includes(message.type)) {
          return resolve(message);
        }
        if (message.type === 'error') {
          return reject(message.error);
        }
        return reject('Uncaught type: ' + JSON.stringify(message));
      };
      worker.postMessage(code);
    });
  };

  /// code execution ///
  try {
    // detect clear event
    if (input.startsWith('.clear') || input.startsWith('clear()')) {
      return { [EvalResultType]: 'event', event: 'CLEAR' };
    }
    if (input.startsWith('.help')) {
      return { [EvalResultType]: 'event', event: 'HELP' };
    }

    const pastCode = [
      'void $$$setConsole(false)',
      ...scope,
      'void $$$setConsole(true)',
    ];
    const wrapped = _safeWrap(input);
    const result = await executeCodeInWorker(
      pastCode.join(';\n') + `;\n${wrapped}`,
      { consoleFn },
    );
    scope.push(wrapped);
    return result;
  } catch (e: any) {
    if (e instanceof Error) {
      return e;
    }
    return new Error(e);
  }
};
