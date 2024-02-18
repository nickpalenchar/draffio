export const EvalResultType = Symbol();

export type SafeEvalResult =
  | { [EvalResultType]: 'result'; result: string }
  | { [EvalResultType]: 'error'; error: string }
  | { [EvalResultType]: 'event'; event: 'CLEAR' }
export class BlockedBySandbox extends Error {
  constructor() {
    super();
    this.name = 'BlockedBySandbox';
    this.message = 'Action blocked';
  }
}
const scope: string[] = [];

const _safeWrap = (input: string) => {
  if (input.trim().startsWith('{') && input.trim().endsWith('}')) {
    return `(${input})`;
  }
  return input;
};
/** silences (voids) statement so it doesn't return something, if applicable */
const _mute = (input: string) => {
  console.log('muting', { input });
  const trimmed = input.trim();
  if (
    trimmed.startsWith('let') ||
    trimmed.startsWith('const') ||
    trimmed.startsWith('var') ||
    trimmed.startsWith('function') ||
    trimmed.startsWith('undefined') ||
    trimmed.startsWith('void') ||
    trimmed.startsWith(';') ||
    !trimmed
  ) {
    return input;
  }

  return `void ${input}`;
};

export const safeEval = async (input: string): Promise<SafeEvalResult> => {
  const blob = new Blob(
    [
      `
  onmessage = function(e) {
    return ((document) => {
      // special events
      console.log('DATA', e.data);

      try {
        const codeToRun =  e.data;
        console.log({ codeToRun });
        const result = eval(codeToRun);
        postMessage({ type: 'result', result });
      } catch (error) {
        if (error?.name === 'DataCloneError') {
          postMessage({type: 'error', error: 'Blocked action.'});
        } else {
          postMessage({ type: 'error', error: error?.message || error.toString() });
        }
      }
    })()
  };
`,
    ],
    { type: 'application/javascript' },
  );

  const worker = new Worker(URL.createObjectURL(blob));

  const executeCodeInWorker = (code: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Handle messages from the worker
      worker.onmessage = (event) => {
        const message = event.data;
        if (message.type === 'result') {
          resolve(message.result);
        } else if (message.type === 'error') {
          reject(new Error(message.error));
        }
      };
      // Post the code to the worker
      worker.postMessage(code);
    });
  };
  try {

    // detect clear event
    if (input.startsWith('.clear') || input.startsWith('clear()')) {
      return { [EvalResultType]: 'event', event: 'CLEAR' }

    }

    const wrapped = _safeWrap(input);
    // scope.push(_safeWrap(input));
    const result = await executeCodeInWorker(
      scope.join(';\n') + `;\n${wrapped}`,
    );

    scope.push(_mute(wrapped));
    return { [EvalResultType]: 'result', result };
  } catch (e: any) {
    return { [EvalResultType]: 'error', error: e.toString() };
  }
};
