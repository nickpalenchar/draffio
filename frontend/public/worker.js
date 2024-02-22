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

  return ((document, console) => {
    // special events
    let result;
    try {
      const codeToRun = e.data;
      result = eval(codeToRun);
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
    if (typeof result === 'function') {
      this.postMessage({
        type: 'result-function',
        result: { name: result.name || '(anonymous)' },
      }); // TODO detect promise object
    } else {
      postMessage({ type: 'result', result });
    }
  })(undefined, $$$shadowConsole);
};
