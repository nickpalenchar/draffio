// eslint-disable-next-line no-undef
console.log('IMPORTING SCRIPTS');
importScripts('/promise.polyfill.js');
onmessage = function (e) {
  console.log('DATA', e.data);
  let $$$consoleOn = true;
  const $$$shadowConsole = {
    log(...args) {
      $$$consoleOn &&
        postMessage({ type: 'console', console: args, level: 'log' });
    },
    warn(...args) {
      $$$consoleOn &&
        postMessage({ type: 'console', console: args, level: 'warn' });
    },
    error(...args) {
      $$$consoleOn &&
        postMessage({ type: 'console', console: args, level: 'error' });
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
      console.error(error);
      if (error?.name === 'DataCloneError') {
        console.error(error);
        postMessage({ type: 'error', error: 'Blocked action.' });
      } else {
        postMessage({
          type: 'error',
          error: error?.message || error.toString(),
        });
      }
    }
    if (result) {
      if (typeof result === 'function') {
        this.postMessage({
          type: 'result-function',
          result: { name: result.name || '(anonymous)' },
        });
      } else {
        postMessage({ type: 'result', result });
      }
    } else {
      postMessage({ type: 'result', result: undefined });
    }
  })(undefined, $$$shadowConsole);
};
