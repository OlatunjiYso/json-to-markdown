// The script should run as follows
// node json_to_markdown.js data.json

const util = require("util");
const fs = require("fs");


// Promisify "error-back" functions.
const fsReadFile = util.promisify(fs.readFile);
const fsWriteFile = util.promisify(fs.writeFile);
const fsAppendFile = util.promisify(fs.appendFile);
const fsAppendFileSync = util.promisify(fs.appendFileSync);


const filename = process.argv.slice(2)[0];


// Reads File
const readFile = async (filename) => {
    let file;
    try {
      file = await fsReadFile(filename, "utf8");
      return JSON.parse(file);
    } catch (err) {
      logError("Error encountered while parsing file . . .");
    }
  };


// Creates the markdown
const generateMarkdown = async(filename) => {
  try {
    const inputFile = await readFile(filename);
    validateInput(inputFile);
    normalizedInput = normalizeInput(inputFile);
    let allKeys = getAllKeys(normalizedInput);
    let uniqueKeys = getUniqueKeys(allKeys);
    await createTableHeader(uniqueKeys);
    createTableBody(uniqueKeys, normalizedInput);
  } catch (err) {
    throw err;
  }
};


// Creates the table header
const createTableHeader = async (titleArray) => {
  let headerTop = "|";
  let headerBottom = "|";
  titleArray.map((title) => {
    headerTop += title + "|";
    headerBottom += "---|";
  });
  try {
    await fsWriteFile("data.md", headerTop + "\n");
    console.log("created header top");
  } catch (err) {
    throw err;
  }

  try {
    await fsAppendFile("data.md", headerBottom + "\n");
    console.log("created header bottom");
  } catch (err) {
    throw err;
  }
};


// Creates the table body
const createTableBody = (uniqueKeys, dataArray) => {
  dataArray.map((data, index) => {
    let row = createRow(uniqueKeys, data);
    try {
      fsAppendFileSync("data.md", row + "\n");
      console.log(`created row: ${index + 1}`);
      if(index + 1 === dataArray.length) console.log('Done!');
    } catch (err) {
      logError("Error encountered while creating rows");
    }
  });
};


// Creates markup for table row
const createRow = (keys, data) => {
  let row = "|";
  keys.map((key) => {
    let value = data[key];
    value = value !== undefined ? value + " |" : " |";
    row += value;
  });
  return row;
};


// Fetches all keys from the input file
const getAllKeys = (dataArray) => {
  let allKeys = [];
  dataArray.map((item) => {
    let currentKeys = Object.keys(item);
    allKeys = [...allKeys, ...currentKeys];
  });
  return allKeys.sort();
};


// Generates a unique list of keys
const getUniqueKeys = (keysArray) => {
  let uniqueKeys = [...new Set(keysArray)];
  return uniqueKeys;
};


// Sets all keys to lowercase
const normalizeInput = (dataArray) => {
    let normalizedData = [];
    dataArray.map((data) => {
      let tempData = {};
      let allKeys = Object.keys(data);
      allKeys.map((key) => {
        tempData[key.toLowerCase()] = data[key];
      });
      normalizedData.push(tempData);
    });
    return normalizedData;
  };


// Function that validates input.
const validateInput = (input) => {
  if (!input instanceof Array) {
    logError("Invalid Input, Input must be an array");
  }
  if (input.length < 1) {
    logError("Invalid Input, Empty Array");
  }
  input.map((item) => {
    if (!isObject(item)) {
      logError("Invalid Input, Input must be array of Objects");
    }
  });
};


// Function that logs error to console and stops process()
const logError = (message) => {
  console.log(message);
  process.exit();
};


// Function to check if an item is an object
const isObject = (obj) => {
  return (
    obj !== null && typeof obj === "object" && Array.isArray(obj) === false
  );
};




// calls the main function 
generateMarkdown(filename);
