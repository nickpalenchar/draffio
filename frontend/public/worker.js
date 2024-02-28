// eslint-disable-next-line no-undef
importScripts('/promise.polyfill.js');
onmessage = function (e) {
  console.log('DATA', e.data);
  let $$$consoleOn = true;
  const $$$shadowConsole = {
    log(...args) {
      $$$consoleOn &&
        void postMessage({ type: 'console', console: args, level: 'log' });
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

  console.log({ codeToRun: e.data });

  const asPassableMessage = (result) => {
    if (typeof result === 'function') {
      return {
        type: 'result-function',
        result: { name: result.name || '(anonymous)' },
      };
    } else if (typeof result === 'symbol') {
      return { type: 'result-symbol', result: result.toString() };
    } else if (
      typeof result === 'object' &&
      result !== null &&
      result.hasOwnProperty('_state') &&
      result.hasOwnProperty('_handled') &&
      result.hasOwnProperty('_value') &&
      result.hasOwnProperty('_deferreds') &&
      result.hasOwnProperty('repr')
    ) {
      return { type: 'result-promise', result: result.repr() };
    } else {
      return { type: 'result', result };
    }
  };

  return ((document, console) => {
    // special events
    let result;
    try {
      const codeToRun = e.data;
      result = eval(codeToRun);

      const message = asPassableMessage(result);
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
  })(undefined, $$$shadowConsole);
};
