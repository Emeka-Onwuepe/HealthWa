export const passwordEncryption = (password) => {

// vectorize the password
 let v_password = Array.from(password)
 .map(char => Buffer.from(char).toString('base64')).join('');
//  replace == with nothing
v_password = v_password.replace(/==/g, '');
// split v_password into chunks of 4
const chunks = v_password.match(/.{1,4}/g) || [];
// convert each chunk to base16 and add the strings
let result = '';
chunks.forEach((chunk, index) => {
    result += Buffer.from(chunk + 'e').toString('base64');
  }
);
// replace = with %
result = result.replace(/=/g, '%');
 return result;
}
// const pp = passwordEncryption('casper@2025');
// console.log(pp)
export const decryptPassword = (encryptedPassword) => {
  // reverse the encryption process
  let result = encryptedPassword.replace(/%/g, '=');
  // split by ==
  let chunks = result.split('=');
  result = '';
  chunks.forEach((chunk) => {
    chunk += '=';
    result += Buffer.from(chunk, 'base64').toString('utf-8').slice(0, -1);
  });
  // split into chunks of 4
  chunks = result.match(/.{1,2}/g) || [];
  result = '';
  chunks.forEach((chunk) => {
    chunk += '==';
    result += Buffer.from(chunk, 'base64').toString('utf-8');
  });
  return result.replace(/ /g,'')
};

export const generateToken = () => {
  // generate a random token of 64 characters
  let token = '';
  for (let i = 0; i < 6; i++) {
    token += Math.random().toString(36).substring(2, 14);
  }
  return token;
};

//  import { v4 as uuidv4 } from 'uuid';

// export const generateToken = () => {
//   return uuidv4();
// };

// console.log(generateToken())

// console.log(decryptedPassword(pp));