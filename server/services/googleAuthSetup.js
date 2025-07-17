import { getAuthUrl, saveTokenFromCode } from './googleCalendar.js';
import readline from 'readline';

async function main() {
  try {
    const url = getAuthUrl();
    console.log('Authorize this app by visiting this url:\n', url);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', async (code) => {
      try {
        await saveTokenFromCode(code.trim());
        console.log('Token stored to token.json!');
      } catch (err) {
        console.error('Error saving token:', err);
      }
      rl.close();
    });
  } catch (err) {
    console.error('Error during OAuth setup:', err);
  }
}

main(); 