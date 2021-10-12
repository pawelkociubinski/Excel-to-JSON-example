const fs = require("fs");
const path = require("path");
const { exit } = require("process");
const excelToJson = require("convert-excel-to-json");
const { trim, isNil, isEmpty } = require("lodash");
const console = require("better-console");
const {
  assocPath,
  constructJSON,
  findPropertyPath,
  isExist,
  removeInvisbleChar,
  toJson,
} = require("./utils");

const labels = "labels";
const treeStructure = "tree structure";

const constructLabels = (params) => {
  const excelData = excelToJson({
    source: fs.readFileSync(params.filePath),
    sheetStubs: true,
    header: {
      rows: 1,
    },
    sheets: [labels],
  });

  if (isNil(excelData[labels])) {
    console.error(`ERROR: ${labels} Sheet doesn't exist`);
    exit(1);
  }

  const value = excelData[labels].reduce((acc, group) => {
    const [key, label] = Object.values(group);

    // If a row is empty, doesn't process it
    if (key === null && label === null) {
      return acc;
    }

    const formatedKey = trim(key);
    const formatedLabel = trim(label);

    // Error handling
    if (!isExist(formatedKey)) {
      console.error("ERROR: Group Key is empty");
      exit(1);
    }

    if (!isExist(formatedLabel)) {
      console.error("ERROR: Group Label is empty");
      exit(1);
    }

    return { ...acc, [formatedKey]: formatedLabel };
  }, {});

  const computedJson = {
    ...params.json,
    ...(isExist(value) && { labels: value }),
  };

  return computedJson;
};

const constructTreeStructure = (params) => {
  const excelData = excelToJson({
    source: fs.readFileSync(params.filePath),
    header: {
      rows: 1,
    },
    sheets: [treeStructure],
  });

  if (isNil(excelData[treeStructure])) {
    console.error(`ERROR: ${treeStructure} Sheet doesn't exist`);
    exit(1);
  }

  const value = excelData[treeStructure].reduce((tree, groups) => {
    const [parent, child] = Object.values(groups);

    const formatedParent = trim(parent);
    const formatedChild = trim(child);

    if (!isExist(formatedParent)) {
      console.error("ERROR: Parent ID is empty");
      exit(1);
    }

    // Consider this case as top level without child
    if (!isExist(formatedChild)) {
      return assocPath(tree, [formatedParent], true);
    }

    const propertyPath = findPropertyPath(tree, formatedParent);

    if (isEmpty(propertyPath)) {
      return assocPath(tree, [formatedParent], {
        [formatedChild]: true,
      });
    } else {
      return assocPath(tree, [...propertyPath, formatedChild], true);
    }
  }, {});

  const computedJson = {
    ...params.json,
    ...(isExist(value) && {
      tree: value,
    }),
  };

  return computedJson;
};

/****************************************************************/

const generateJSON = (inputFileName) => {
  const currentDirectory = process.cwd();
  const filePath = path.join(currentDirectory, inputFileName);
  const fileWithoutExtension = path.parse(inputFileName).name;

  const json = {};

  const output = constructJSON(
    constructLabels,
    constructTreeStructure
  )({ json, filePath });

  fs.writeFileSync(
    path.join(currentDirectory, `${fileWithoutExtension}.json`),
    toJson(output)
  );
  console.log(
    `File ${fileWithoutExtension} is generated in ${currentDirectory}`
  );
};

module.exports.generateJSON = generateJSON;
