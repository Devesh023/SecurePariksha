import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelsDir = path.join(__dirname, '..', 'public', 'models');

// Ensure directory exists
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

const baseUrl = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js-models@master';

const filesToDownload = [
  // Tiny Face Detector
  {
    url: `${baseUrl}/tiny_face_detector/tiny_face_detector_model-weights_manifest.json`,
    filename: 'tiny_face_detector_model-weights_manifest.json',
  },
  {
    url: `${baseUrl}/tiny_face_detector/tiny_face_detector_model-shard1`,
    filename: 'tiny_face_detector_model-shard1',
  },
  // Face Landmark 68
  {
    url: `${baseUrl}/face_landmark_68/face_landmark_68_model-weights_manifest.json`,
    filename: 'face_landmark_68_model-weights_manifest.json',
  },
  {
    url: `${baseUrl}/face_landmark_68/face_landmark_68_model-shard1`,
    filename: 'face_landmark_68_model-shard1',
  },
  // Face Expression
  {
    url: `${baseUrl}/face_expression/face_expression_model-weights_manifest.json`,
    filename: 'face_expression_model-weights_manifest.json',
  },
  {
    url: `${baseUrl}/face_expression/face_expression_model-shard1`,
    filename: 'face_expression_model-shard1',
  },
];

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (Status Code: ${response.statusCode})`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('---------------------------------------------------------');
  console.log('Downloading AI Face Proctoring Model Weights...');
  console.log(`Target Directory: ${modelsDir}`);
  console.log('---------------------------------------------------------');

  for (const item of filesToDownload) {
    const dest = path.join(modelsDir, item.filename);
    console.log(`Downloading ${item.filename}...`);
    try {
      await downloadFile(item.url, dest);
      console.log(`Successfully downloaded: ${item.filename}`);
    } catch (error) {
      console.error(`Error downloading ${item.filename}:`, error.message);
    }
  }

  console.log('All model weights ready.');
  console.log('---------------------------------------------------------');
}

main();
