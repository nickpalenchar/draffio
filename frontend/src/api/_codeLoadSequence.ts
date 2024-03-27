

const values = ['0', '0', '1', '1', '0', '1', '#', '%'];

const randomValue = (weight = 0) => {
  const empties = new Array(weight).fill(' ');
  const allValues = [...empties, ...values];
  return allValues[Math.floor(Math.random() * allValues.length)];
}

const randomLine = (weight = 0) => new Array(60).fill(' ').map(() => randomValue(weight)).join('')

export const generateCodeLoad = (weight = 0) => {
  return new Array(30).fill(' ').map(() => randomLine(Math.round(weight))).join('\n');
}