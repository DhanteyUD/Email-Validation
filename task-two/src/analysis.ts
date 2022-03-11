/**
 * First task - Read the csv files in the inputPath and analyse them
 *
 * @param {string[]} inputPaths An array of csv files to read
 * @param {string} outputPath The path to output the analysis
 */

// Import fs and validator ...
import fs from 'fs';
import validator from 'email-validator';

// Make analyseFiles an asynchronous function ...
async function analyseFiles(inputPaths: string[], outputPath: string) {
  try {
    // Create input and output streams ...
    const readableStream = fs.createReadStream(inputPaths[0], 'utf8');
    const writableStream = fs.createWriteStream(outputPath);

    // Create data string to hold streamed data chunk ...
    let data = '';

    const streamData = fs.createReadStream(inputPaths[0]);
    for await (let chunk of streamData as fs.ReadStream) {
      data += chunk;
    }

    // Create interface for Domain ...
    interface Domain {
      [key: string]: number;
    }

    // Check if email has a valid domain ...
    const validDomains: Domain = {};
    let validEmails = 0;

    readableStream.on('data', (data) => {
      const validEmailChunk = data
        .split('\n')
        .filter((email: string) => validator.validate(email));

      for (let email of validEmailChunk) {
        const Domain = email.split('@')[1];
        if (!validDomains[Domain]) {
          validDomains[Domain] = 1;
        } else {
          validDomains[Domain] += 1;
        }
      }
      validEmails += validEmailChunk.length;
      console.log(validDomains);
    });

    // Output data ...
    readableStream.on('close', () => {
      const outputData = {
        'valid-domains': Object.keys(validDomains),
        totalEmailsParsed: data.trim().split('\n').slice(1).length,
        totalValidEmails: validEmails,
        categories: validDomains,
      };

      writableStream.write(JSON.stringify(outputData, null, 3));
    });
  } catch (err) {
    console.log(err);
  }
}

// console.log(
//   analyseFiles(['fixtures/inputs/small-sample.csv'], 'report-analysis.json'),
// );

export default analyseFiles;
