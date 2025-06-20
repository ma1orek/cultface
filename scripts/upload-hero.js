import dotenv from 'dotenv';
import { put } from '@vercel/blob';
import { promises as fs } from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const filePath = path.join(process.cwd(), 'public', 'Hero.gif');
  const fileBuffer = await fs.readFile(filePath);

  const blob = await put('Hero.gif', fileBuffer, {
    access: 'public',
  });

  console.log('File uploaded successfully!');
  console.log('Your file is available at:', blob.url);
}

main().catch((error) => {
  console.error('Error uploading file:', error);
  process.exit(1);
}); 