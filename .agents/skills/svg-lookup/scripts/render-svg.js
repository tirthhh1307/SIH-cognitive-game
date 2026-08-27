const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

function parseArgs(args) {
  const options = {
    input: null,
    output: null,
    width: null,
    height: null,
    background: null
  };

  const positional = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--bg' || arg === '-b') {
      options.background = args[++i];
    } else if (arg === '--width' || arg === '-w') {
      options.width = parseInt(args[++i], 10);
    } else if (arg === '--height' || arg === '-h') {
      options.height = parseInt(args[++i], 10);
    } else {
      positional.push(arg);
    }
  }

  if (positional.length >= 1) options.input = positional[0];
  if (positional.length >= 2) options.output = positional[1];
  if (positional.length >= 3 && !options.width) options.width = parseInt(positional[2], 10);
  if (positional.length >= 4 && !options.height) options.height = parseInt(positional[3], 10);

  return options;
}

const opts = parseArgs(process.argv.slice(2));

if (!opts.input) {
  console.error(JSON.stringify({ status: "error", message: "Usage: node render-svg.js <input.svg|-> [output.png] [--bg #1a1a1a] [--width 500] [--height 500]" }));
  process.exit(1);
}

let svgString = '';
let inputPath = opts.input;

if (opts.input === '-') {
  svgString = fs.readFileSync(0, 'utf-8');
  inputPath = 'stdin.svg';
} else {
  inputPath = path.resolve(opts.input);
  if (!fs.existsSync(inputPath)) {
    console.error(JSON.stringify({ status: "error", message: `File not found: ${inputPath}` }));
    process.exit(1);
  }
  svgString = fs.readFileSync(inputPath, 'utf-8');
}

const outputPath = opts.output
  ? path.resolve(opts.output)
  : (opts.input === '-' ? path.resolve('output.png') : inputPath.replace(/\.svg$/i, '.png'));

try {
  const resvgOpts = {};
  if (opts.width) {
    resvgOpts.fitTo = { mode: 'width', value: opts.width };
  } else if (opts.height) {
    resvgOpts.fitTo = { mode: 'height', value: opts.height };
  }

  if (opts.background) {
    let bg = opts.background;
    if (bg === 'dark') bg = '#0d0f12';
    if (bg === 'light' || bg === 'white') bg = '#ffffff';
    resvgOpts.background = bg;
  }

  const resvg = new Resvg(svgString, resvgOpts);
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, pngBuffer);

  console.log(JSON.stringify({
    status: "success",
    input: inputPath,
    output: outputPath,
    width: pngData.width,
    height: pngData.height,
    background: opts.background || 'default'
  }));
} catch (err) {
  console.error(JSON.stringify({ status: "error", message: err.message }));
  process.exit(1);
}
