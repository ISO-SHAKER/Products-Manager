import { Command } from "commander";
import inquirer from "inquirer";
import fs from "node:fs";
import { promisify } from "util";

const program = new Command();
const filePath = "./data/products.json";

const questions = [
  {
    type: "input",
    name: "title",
    message: "What is product title?",
    validate: (input) => {
      if (!input.trim()) {
        return "Please enter a title";
      }
      return true;
    },
  },
  {
    type: "number",
    name: "price",
    message: "What is product price?",
    validate: (input) => {
      if (isNaN(input)) {
        return "Please enter a valid price";
      }
      return true;
    },
  },
];

const idQuestion = [
  {
    type: "number",
    name: "id",
    message: "What is product id?",
    validate: (input) => {
      if (isNaN(input)) {
        return "Please enter a valid id";
      }
      return true;
    },
  },
];

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

/**
 * POST Product
 */
program
  .command("add")
  .alias("a")
  .description("Create Product")
  .action(async () => {
    try {
      const answers = await inquirer.prompt(questions);
      const products = await getProducts();
      const productId = products.length
        ? products[products.length - 1].id + 1
        : 1;
      const product = { id: productId, ...answers };
      products.push(product);
      await writeFileAsync(filePath, JSON.stringify(products), "utf8");
      console.log("Product added successfully");
    } catch (error) {
      console.error("Error adding product:", error);
    }
  });

/**
 * GET Product By Id
 */
program
  .command("get")
  .alias("g")
  .description("Read Product By Id")
  .action(async () => {
    try {
      const products = await getProducts();
      if (products.length) {
        const answers = await inquirer.prompt(idQuestion);
        const product = products.find((p) => p.id === answers.id);
        if (product) {
          console.table(product);
        } else {
          console.log("Product not found");
        }
      } else {
        console.log("No products found");
      }
    } catch (error) {
      console.error("Error getting products:", error);
    }
  });

/**
 * PATCH Product By Id
 */
program
  .command("patch")
  .alias("p")
  .description("Update Product By Id")
  .action(async () => {
    try {
      const products = await getProducts();
      if (products.length) {
        const answers = await inquirer.prompt(idQuestion);
        const product = products.find((p) => p.id === answers.id);
        if (product) {
          console.log("===== Before Update =====");
          console.table(product);
          const answers = await inquirer.prompt(questions);
          product.title = answers.title;
          product.price = answers.price;
          console.log("===== After Update =====");
          console.table(product);
          await writeFileAsync(filePath, JSON.stringify(products), "utf8");
          console.log("Product updated successfully");
        } else {
          console.log("Product not found");
        }
      } else {
        console.log("No products found");
      }
    } catch (error) {
      console.error("Error getting products:", error);
    }
  });

/**
 * DELETE Product By Id
 */
program
  .command("delete")
  .alias("d")
  .description("Delete Product By Id")
  .action(async () => {
    try {
      const products = await getProducts();
      if (products.length) {
        const answers = await inquirer.prompt(idQuestion);
        const product = products.find((p) => p.id === answers.id);
        if (product) {
          console.table(product);
          const index = products.indexOf(product);
          products.splice(index, 1);
          await writeFileAsync(filePath, JSON.stringify(products), "utf8");
          console.log("Product deleted successfully");
        } else {
          console.log("Product not found");
        }
      } else {
        console.log("No products found");
      }
    } catch (error) {
      console.error("Error getting products:", error);
    }
  });

/**
 * GET All Products
 */
program
  .command("list")
  .alias("l")
  .description("Get All Products")
  .action(async () => {
    try {
      const products = await getProducts();
      if (products.length) {
        console.table(products);
      } else {
        console.log("No products found");
      }
    } catch (error) {
      console.error("Error getting products:", error);
    }
  });

async function getProducts() {
  try {
    const data = await readFileAsync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

program.parse(process.argv);
