/**
 * Stretch goal - Validate all the emails in this files and output the report
 *
 * @param {string[]} inputPath An array of csv files to read
 * @param {string} outputFile The path where to output the report
 */

import fs from 'fs';
import validator from 'email-validator';
import { promises as dns } from 'dns';

async function validateEmailAddresses(inputPath: string[], outputFile: string) {
  const inputStream = fs.createReadStream(inputPath[0], 'utf8');
  const outputStream = fs.createWriteStream(outputFile);
  interface statusObj {
    [key: string]: boolean;
  }
  const domainsStatus: statusObj = {};
  const validEmails = [];
  outputStream.write('Email \n');
  inputStream.on('data', async (data) => {
    const emails = data.trim().split('\n');
    console.log(`${emails.length} emails taken in to be validated`);
    try {
      let i = 0;
      for (const email of emails) {
        if (validator.validate(email)) {
          const domainName = email.split('@')[1];
          if (
            domainsStatus[domainName] ||
            domainsStatus[domainName] === false
          ) {
            validEmails.push(email);
            if (domainsStatus[domainName]) outputStream.write(email + '\n');
            console.log(`${validEmails.length} valid emails found`);
            continue;
          }

          const resolveObj = await dns
            .resolveMx(domainName)
            .then(() => {
              return true;
            })
            .catch((err) => {
              if (err.code === 'ENODATA') return false;
            });
          if (resolveObj) {
            outputStream.write(email + '\n');
            validEmails.push(email);
            domainsStatus[domainName] = resolveObj;
          }
          if (resolveObj === false) domainsStatus[domainName] = resolveObj;
          i++;
        }
      }
    } catch (err) {
      console.log(err);
    }
  });
  inputStream.on('close', () => {
    console.log('Completed');
  });
}

// console.log(
//   validateEmailAddresses(['fixtures/inputs/small-sample.csv'], 'test.csv'),
// );

export default validateEmailAddresses;
