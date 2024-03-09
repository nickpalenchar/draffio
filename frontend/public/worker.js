const $globals = {};
const REAL_PROMISE = Symbol('RealPromise');
$globals[REAL_PROMISE] = Promise;

// eslint-disable-next-line no-undef
importScripts('/promise.polyfill.js');

onmessage = function (e) {
  console.log({ codeToRun: e.data });
  const asPassableMessage = (result) => {
    if (typeof result === 'string') {
      return { type: 'result-string', result };
    }
    if (typeof result === 'number') {
      return { type: 'result-number', result };
    }
    if (typeof result === 'boolean') {
      return { type: 'result-boolean', result };
    }
    if (typeof result === 'object' && result === null) {
      return { type: 'result-null', result };
    }
    if (typeof result === 'undefined') {
      return { type: 'result-undefined' };
    }
    if (typeof result === 'symbol') {
      return { type: 'result-symbol', result: result.toString() };
    }
    if (typeof result === 'function') {
      return {
        type: 'result-function',
        result: { name: result.name || '(anonymous)' },
      };
    } else if (result instanceof Date) {
      return {
        type: 'result-date',
        result: result.toJSON(),
      };
    } else if (Array.isArray(result)) {
      return {
        type: 'result-array',
        result: result.map(asPassableMessage),
      };
    } else if (
      typeof result === 'object' &&
      result !== null &&
      result.hasOwnProperty('_state') &&
      result.hasOwnProperty('_handled') &&
      result.hasOwnProperty('_value') &&
      result.hasOwnProperty('_deferreds') &&
      result.hasOwnProperty('repr')
    ) {
      const promiseClone = result.repr();
      promiseClone.value = asPassableMessage(promiseClone.value);
      return { type: 'result-promise', result: result.repr() };
      // NOTE! This *must* be 2nd to last since we need to detect all
      // overlaps of objects (null, Array, Promise) first.
    } else if (result instanceof $globals[REAL_PROMISE]) {
      const promiseClone = new Promise((resolve, reject) => {
        result.then(resolve).catch(reject);
      }).repr();
      promiseClone.value = asPassableMessage(promiseClone.value);
      return { type: 'result-promise', result: promiseClone };
    } else if (typeof result === 'object') {
      const symbols = Object.getOwnPropertySymbols(result).map((symbol) => {
        return {
          key: {
            keyType: 'symbol',
            keyValue: symbol.toString(),
          },
          value: asPassableMessage(result[symbol]),
        };
      });
      return {
        type: 'result-object',
        result: [
          ...symbols,
          ...Object.entries(result).map(([key, value]) => {
            const keyMessage = asPassableMessage(key);
            const valueMessage = asPassableMessage(value);

            if (keyMessage.result === 'result-symbol') {
              return {
                key: { keyType: 'symbol', keyValue: keyMessage },
                value: valueMessage,
              };
            }
            return {
              key: { keyType: 'string', keyValue: keyMessage.result },
              value: valueMessage,
            };
          }),
        ],
      };
    } else {
      return { type: 'result', result };
    }
  };

  const C = Symbol('console');
  const SET_TIMEOUT = Symbol();
  const SET_INTERVAL = Symbol();
  const CLEAR_INTERVAL = Symbol();
  const ext = { [C]: console, [SET_INTERVAL]: setInterval };
  let $$$consoleOn = true;
  const $$$shadowConsole = {
    log(...args) {
      $$$consoleOn &&
        void postMessage({
          type: 'console',
          console: args.map(asPassableMessage),
          level: 'log',
        });
    },
    warn(...args) {
      $$$consoleOn &&
        void postMessage({ type: 'console', console: args, level: 'warn' });
    },
    error(...args) {
      $$$consoleOn &&
        void postMessage({ type: 'console', console: args, level: 'error' });
    },
  };
  const $$$setConsole = (state) => ($$$consoleOn = state);
  const $$$setTimeout = (cb, timeout) => {
    if (typeof cb !== 'function') {
      return;
    }
    const serializedFunction = cb.toString();
    this.postMessage({
      type: 'callback',
      callbackType: 'timeout',
      functionData: serializedFunction,
      timeout,
    });
  };

  return ((document, console, setTimeout) => {
    // special events
    let result;
    try {
      const codeToRun = e.data;
      result = eval(codeToRun);

      const message = asPassableMessage(result);
      ext[C].log('message becomes', message);
      this.postMessage(message);
    } catch (error) {
      if (error?.name === 'DataCloneError') {
        postMessage({ type: 'error', error: 'Unsupported Statement.' });
      } else {
        postMessage({
          type: 'error',
          error: error?.message || error.toString(),
        });
      }
    }
  })(undefined, $$$shadowConsole, $$$setTimeout);
};
