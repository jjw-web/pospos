import sharp from 'sharp';

const svgIcon = `<svg width="180" height="180" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="180" fill="#667eea"/>
  <text x="90" y="130" font-family="Arial" font-size="100" font-weight="bold" fill="white" text-anchor="middle">B</text>
</svg>`;

await sharp(Buffer.from(svgIcon)).png().toFile('public/icon-180.png');
console.log('Created icon-180.png');

await sharp(Buffer.from(svgIcon)).resize(512, 512).png().toFile('public/icon-512.png');
console.log('Created icon-512.png');