/**
 * Stretch goal - Validate all the emails in this files and output the report
 *
 * @param {string[]} inputPath An array of csv files to read
 * @param {string} outputFile The path where to output the report
 */

// Import fs, validator and dns ...
import fs from 'fs';
import validator from 'email-validator';
import { promises as dns } from 'dns';

// Make validateEmailAddresses an asynchronous function ...
async function validateEmailAddresses(inputPath: string[], outputFile: string) {
  const readableStream = fs.createReadStream(inputPath[0], 'utf8');
  const writableStream = fs.createWriteStream(outputFile);

  // Create interface for statusObj ...
  interface statusObj {
    [key: string]: boolean;
  }

  // Check for email status ans validate them ...
  const domainsStatus: statusObj = {};
  const validEmails = [];

  writableStream.write('Email \n');
  readableStream.on('data', async (data) => {
    const emails = data.trim().split('\n');
    console.log(`${emails.length} emails taken in to be validated`);
    try {
      let count = 0;
      for (const email of emails) {
        if (validator.validate(email)) {
          const domainName = email.split('@')[1];
          if (
            domainsStatus[domainName] ||
            domainsStatus[domainName] === false
          ) {
            validEmails.push(email);
            if (domainsStatus[domainName]) writableStream.write(email + '\n');
            console.log(`${validEmails.length} valid emails found`);
            continue;
          }

          // Looks up mail exchange records for the domain ...
          const resolveObj = await dns
            .resolveMx(domainName)
            .then(() => {
              return true;
            })
            .catch((err) => {
              if (err.code === 'ENODATA') return false;
            });
          if (resolveObj) {
            writableStream.write(email + '\n');
            validEmails.push(email);
            domainsStatus[domainName] = resolveObj;
          }
          if (resolveObj === false) domainsStatus[domainName] = resolveObj;
          count++;
        }
      }
    } catch (err) {
      console.log(err);
    }
  });
  readableStream.on('close', () => {
    console.log('Completed');
  });
}

// console.log(
//   validateEmailAddresses(['fixtures/inputs/small-sample.csv'], 'test.csv'),
// );

export default validateEmailAddresses;
