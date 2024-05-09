import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname in ES module scope
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const controllersPath = path.join(__dirname, "controllers");
const modelsPath = path.join(__dirname, "models");
const routesPath = path.join(__dirname, "routes");

const ensureDirSync = (dirpath) => {
  if (!fs.existsSync(dirpath)) {
    fs.mkdirSync(dirpath, { recursive: true });
  }
};

const createFile = (filePath, content) => {
  fs.writeFileSync(filePath, content);
  console.log(`File created: ${filePath}`);
};

const createController = (name) => {
  const content = `// ${name} controller
export const get${name} = (req, res) => {
  // Handle GET request for ${name}
};

export const create${name} = (req, res) => {
  // Handle POST request to create ${name}
};

// Add more controller methods as needed
`;

  const filePath = path.join(controllersPath, `${name}.js`);
  ensureDirSync(controllersPath);
  createFile(filePath, content.trim());
};

const createModel = (name) => {
  const content = `import mongoose from 'mongoose';

const ${name}Schema = new mongoose.Schema({
  // Define the schema fields
});

const ${name} = mongoose.model('${name}', ${name}Schema);

export default ${name};
`;

  const filePath = path.join(modelsPath, `${name}.js`);
  ensureDirSync(modelsPath);
  createFile(filePath, content.trim());
};

const createRoute = (name) => {
  const lowerName = name.toLowerCase();
  const content = `import express from 'express';
import { get${name}, create${name} } from '../controllers/${name}.js';

const router = express.Router();

router.get('/${lowerName}', get${name});
router.post('/${lowerName}', create${name});

// Define more ${lowerName} routes here

export default router;
`;

  const filePath = path.join(routesPath, `${lowerName}.js`);
  ensureDirSync(routesPath);
  createFile(filePath, content.trim());
};

const args = process.argv.slice(2);
const [command, entityName] = args;

switch (command) {
  case "make:controller":
    if (entityName) {
      createController(entityName);
    } else {
      console.log("Please provide a controller name.");
    }
    break;
  case "make:model":
    if (entityName) {
      createModel(entityName);
    } else {
      console.log("Please provide a model name.");
    }
    break;
  case "make:route":
    if (entityName) {
      createRoute(entityName);
    } else {
      console.log("Please provide a route name.");
    }
    break;
  default:
    console.log("Invalid command.");
}
