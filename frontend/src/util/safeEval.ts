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
interface SafeEvalOptions {
  consoleFn?: ConsoleFn;
}

const scope: string[] = [];


const _safeWrap = (input: string) => {
  if (input.trim().startsWith('{') && input.trim().endsWith('}')) {
    return `(${input})`;
  }
  return input;
};

export const safeEval = async (
  input: string,
  { consoleFn }: SafeEvalOptions = {},
): Promise<any> => {
  console.log('calling', { input });

  const worker = new Worker('/worker.js');

  const executeCodeInWorker = (
    code: string,
    { consoleFn }: SafeEvalOptions = {},
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      // Handle messages from the worker
      worker.onmessage = (event) => {
        console.log('EVENT', event);
        const message = event.data;
        if (message.type === 'console') {
          return consoleFn?.(message.level, message.console);
        }
        if (message.type === 'result') {
          resolve(message.result);
        } else if (message.type === 'result-function') { 
          resolve({ [EvalResultType]: 'function', name: message.result.name })
        } else if (message.type === 'error') {
          reject(new Error(message.error));
        }
      };
      // Post the code to the worker
      worker.postMessage(code);
    });
  };

  /** silences (voids) statement so it doesn't return something, if applicable */
  const _mute = async (input: string) => {
    // TODO this might not be needed
    return input;
    const trimmed = input.trim();
    if (
      trimmed.startsWith('let') ||
      trimmed.startsWith('const') ||
      trimmed.startsWith('var') ||
      trimmed.startsWith('function') ||
      trimmed.startsWith('async') ||
      trimmed.startsWith('undefined') ||
      trimmed.startsWith('void') ||
      trimmed.startsWith(';') ||
      !trimmed
    ) {
      return input;
    }
    try {
      await executeCodeInWorker(`void ${input}`);
      return `void ${input}`;
    } catch {
      return input;
    }
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

    const pastCode = ['$$$setConsole(false)', ...scope, '$$$setConsole(true)'];

    const wrapped = _safeWrap(input);
    const mutedResult = await _mute(wrapped);
    const result = await executeCodeInWorker(
      pastCode.join(';\n') + `;\n${wrapped}`,
      { consoleFn },
    );

    scope.push(mutedResult);
    return result;
  } catch (e: any) {
    if (e instanceof Error) {
      return e;
    }
    return new Error(e);
  }
};
