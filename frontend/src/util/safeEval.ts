// not yet safe :)

type EvalResult = { result: string };

export type SafeEvalResult = { type: 'result', result: string } | { type: 'error', error: string };
export class BlockedBySandbox extends Error {
  constructor() {
    super();
    this.name = 'BlockedBySandbox';
    this.message = 'Action blocked';
  }
}
const scope: string[] = [];

export const safeEval = async (input: string): Promise<SafeEvalResult> => {
  // const wrapper =
  const blocked = new Proxy(function () {}, {
    get() {
      throw new BlockedBySandbox();
    },
    set() {
      throw new BlockedBySandbox();
    },
    apply() {
      throw new BlockedBySandbox();
    },
  });

  const blob = new Blob(
    [
      `
  onmessage = function(e) {
    return ((document) => {
      try {
        const result = eval(e.data);
        postMessage({ type: 'result', result });
      } catch (error) {
        if (error?.name === 'DataCloneError') {
          postMessage({type: 'error', error: 'Blocked action.'});
        } else {
          postMessage({ type: 'error', error: error.toString() });
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
    scope.push(input);
    const result = await executeCodeInWorker(scope.join(';\n'))
    return { type: 'result', result };
  } catch (e: any) {
    scope.pop();
    return { type: 'error', error: e.toString() };
  }
};

// const wrapper = `
// (() => {
//   function wrapped() {
//     return ${input};
//   }
//   return wrapped.call(null);
// })()
// `;

//   return eval(wrapper);
// }
