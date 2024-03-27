

const values = [' ', '0', '1', '#', '%'];

const randomValue = () => values[Math.floor(Math.random() * values.length)];

const randomLine = () => new Array(40).fill(' ').map(randomValue).join('')

export const generateCodeLoad = () => {
  return new Array(40).fill(' ').map(randomLine).join('\n');
}