const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="red"/></svg>`;
const testSvgPath = path.join(__dirname, 'sample.svg');
const testPngPath = path.join(__dirname, 'sample.png');

fs.writeFileSync(testSvgPath, sampleSvg);

try {
  const scriptPath = path.join(__dirname, '../scripts/render-svg.js');
  const out = execSync(`node "${scriptPath}" "${testSvgPath}" "${testPngPath}"`).toString();
  console.log("Output:", out);
  if (!fs.existsSync(testPngPath)) throw new Error("PNG output not generated");
  console.log("PASS: Renderer generated PNG");
} finally {
  if (fs.existsSync(testSvgPath)) fs.unlinkSync(testSvgPath);
  if (fs.existsSync(testPngPath)) fs.unlinkSync(testPngPath);
}
