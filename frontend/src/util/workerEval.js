/**
 * This is read in via a worker and is not intended to be ran directly
 */
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

  const safeEval = new Function('document', 'console');

  return ((document, console) => {
    // special events
    try {
      const codeToRun = e.data;
      const result = eval(codeToRun);
      postMessage({ type: 'result', result });
    } catch (error) {
      if (error?.name === 'DataCloneError') {
        postMessage({ type: 'error', error: 'Blocked action.' });
      } else {
        postMessage({
          type: 'error',
          error: error?.message || error.toString(),
        });
      }
    }
  })(undefined, $$$shadowConsole);
};
