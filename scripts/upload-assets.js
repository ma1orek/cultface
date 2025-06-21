import dotenv from 'dotenv';
import { put } from '@vercel/blob';
import { promises as fs } from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const filesToUpload = [
  'Jack Nicholson.jpg'
];

async function main() {
  console.log('Starting asset upload...');
  const urls = {};

  for (const fileName of filesToUpload) {
    const filePath = path.join(process.cwd(), 'public', fileName);
    console.log(`Uploading ${fileName}...`);
    
    try {
      const fileBuffer = await fs.readFile(filePath);
      const blob = await put(fileName, fileBuffer, {
        access: 'public',
        contentType: fileName.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg',
      });
      console.log(`  Done: ${blob.url}`);
      urls[fileName] = blob.url;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.error(`  Error: File not found at ${filePath}. Skipping.`);
      } else {
        console.error(`  Error uploading ${fileName}:`, error.message);
      }
    }
  }

  console.log('\n--- Upload Complete ---');
  console.log('Use these URLs in your scenes array:');
  console.log(JSON.stringify(urls, null, 2));
}

main().catch((error) => {
  console.error('\nAn unexpected error occurred:', error);
  process.exit(1);
}); 