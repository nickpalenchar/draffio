

const values = ['0', '0', '1', '1', '0', '1'];

const randomValue = (weight = 0) => {
  const empties = new Array(weight).fill(' ');
  const allValues = [...empties, ...values];
  return allValues[Math.floor(Math.random() * allValues.length)];
}

const randomLine = (weight = 0) => new Array(60).fill(' ').map(() => randomValue(weight)).join('')

export const generateCodeLoad = (weight = 0) => {
  const screen = new Array(30).fill(' ').map(() => randomLine(Math.round(weight)));

  const line = screen[10].split('')
  line.splice(25, 7, ...'LOADING...');
  screen[10] = line.join('');
  return screen.join('\n');
}