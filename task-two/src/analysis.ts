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
  // Assign input and output streams ...
  const inputStream = fs.createReadStream(inputPaths[0], 'utf8');
  const outputStream = fs.createWriteStream(outputPath);

  let data = '';

  const streamData = fs.createReadStream(inputPaths[0]);
  for await (let chunk of streamData as fs.ReadStream) {
    data += chunk;
  }
  interface Domain {
    [key: string]: number;
  }

  const validDomains: Domain = {};
  let validEmails = 0;

  inputStream.on('data', (data) => {
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
  });

  inputStream.on('close', () => {
    const outputData = {
      'valid-domains': Object.keys(validDomains),
      totalEmailsParsed: data.trim().split('\n').slice(1).length,
      totalValidEmails: validEmails,
      categories: validDomains,
    };

    outputStream.write(JSON.stringify(outputData, null, 3));
  });
}

// console.log(
//   analyseFiles(['fixtures/inputs/medium-sample.csv'], 'report-analysis.json'),
// );

export default analyseFiles;
