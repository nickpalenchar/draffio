import crypto from "crypto";

// Generate a CUID using crypto
const generateCuid = () => {
  const randomBytes = crypto.randomBytes(10);
  const cuid = 'c' + randomBytes.toString('hex').replace(/[+/]/g, 'd').replace(/=+$/, '');
  return cuid;
};

// Example usage
const cuid = generateCuid();
console.log(cuid); // Output: cXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
