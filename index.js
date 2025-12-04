import fs from "fs-extra";
import { createCanvas, loadImage } from "canvas";

const WIDTH = 1024;
const HEIGHT = 1024;

const LAYERS = [
  { name: "background", path: "layers/background" },
  { name: "liquid", path: "layers/liquid" },
  { name: "glass", path: "layers/glass" },
  { name: "details", path: "layers/details" },
  { name: "base", path: "layers/base" },
  { name: "alco", path: "layers/alco" }
];

function getFiles(path) {
  return fs.readdirSync(path).filter(f => f.endsWith(".png"));
}

async function drawLayer(ctx, filePath) {
  const img = await loadImage(filePath);
  ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);
}

async function generateOne(id) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  const attributes = [];

  for (const layer of LAYERS) {
    const files = getFiles(layer.path);
    const choice = files[Math.floor(Math.random() * files.length)];
    await drawLayer(ctx, `${layer.path}/${choice}`);
    attributes.push({
      trait_type: layer.name,
      value: choice.replace(".png", "")
    });
  }

  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(`output/images/${id}.png`, buffer);

  const metadata = {
    name: `Cocktail NFT #${id}`,
    description: "Generative cocktail NFT",
    image: `ipfs://bafybeiemt6cl5bnivbgn5d5veiwleo574gk4bvgbnyqjiu2kftv27kpziq/${id}.png`,
    attributes: attributes
  };

  fs.writeFileSync(
    `output/metadata/${id}.json`,
    JSON.stringify(metadata, null, 2)
  );
}

async function main() {
  fs.ensureDirSync("output/images");
  fs.ensureDirSync("output/metadata");

  const total = 50;

  for (let i = 1; i <= total; i++) {
    console.log(`Generating #${i}`);
    await generateOne(i);
  }

  console.log("Done.");
}

main();
