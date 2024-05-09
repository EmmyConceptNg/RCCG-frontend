import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname in ES module scope
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const basePath = __dirname; // Adjust for your project structure

const folders = {
  controllers: path.join(basePath, "controllers"),
  models: path.join(basePath, "models"),
  routes: path.join(basePath, "routes"),
};

const templates = {
  controller: (name) => `import ${name} from '../models/${name}.js';

// ${name} controller
export const get${name} = async (req, res) => {
  // Handle GET request for ${name}
  try {
    const items = await ${name}.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const create${name} = async (req, res) => {
  // Handle POST request to create ${name}
  try {
    const newItem = new ${name}(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add more controller methods as needed
`,

  model: (name) => `import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  // Define schema fields
});

const ${name} = mongoose.model('${name}', schema);

export default ${name};
`,

  route: (name) => `import express from 'express';
import { get${name}, create${name} } from '../controllers/${name}Controller.js';

const router = express.Router();

router.get('/${name.toLowerCase()}', get${name});
router.post('/${name.toLowerCase()}', create${name});

// Add more routes as needed

export default router;
`,
};

const createFileIfNeeded = (folder, fileName, template) => {
  ensureDirSync(folder);
  const filePath = path.join(folder, `${fileName}.js`);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, template);
    console.log(`Created ${fileName}.js in ${folder}`);
  } else {
    console.log(`${fileName}.js already exists in ${folder}`);
  }
};

const ensureDirSync = (dirpath) => {
  if (!fs.existsSync(dirpath)) {
    fs.mkdirSync(dirpath, { recursive: true });
  }
};

const scaffoldMCR = (entityName) => {
  const modelName = entityName.charAt(0).toUpperCase() + entityName.slice(1);

  createFileIfNeeded(folders.models, modelName, templates.model(modelName));
  createFileIfNeeded(
    folders.controllers,
    modelName + "Controller",
    templates.controller(modelName)
  );
  createFileIfNeeded(folders.routes, modelName, templates.route(modelName));
};

const args = process.argv.slice(2);
const [command, entityName] = args;

if (command === "make:mcr" && entityName) {
  scaffoldMCR(entityName);
} else {
  console.log("Invalid command or entity name not provided.");
}
