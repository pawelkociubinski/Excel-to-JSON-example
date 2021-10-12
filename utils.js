const { isNil, isEmpty, isPlainObject } = require("lodash");

const removeInvisbleChar = (str) => {
  if (str === undefined) return undefined;

  const invisbleChar = new RegExp(/[\u200b]/g);
  return str.replace(invisbleChar, "");
};

const toJson = (data) => {
  if (data) {
    return removeInvisbleChar(JSON.stringify(data, null, 4));
  }
};

function constructJSON(...args) {
  return (params) => {
    const { json, ...rest } = params;
    const [head, ...tail] = args;

    const computedJson = head({ json, ...rest });

    return isEmpty(tail)
      ? computedJson
      : constructJSON(...tail)({ json: computedJson, ...rest });
  };
}

const assocPath = (tree = {}, path, value) => {
  const [head, ...tail] = path;

  if (isEmpty(tail)) {
    return { ...tree, [head]: value };
  } else {
    return { ...tree, [head]: assocPath(tree[head], tail, value) };
  }
};

const findPropertyPath = (tree, key, path = []) => {
  for (let property in tree) {
    if (property === key) {
      return [...path, key];
    } else if (isPlainObject(tree[property])) {
      const result = findPropertyPath(tree[property], key);

      if (!isEmpty(result)) {
        return [...path, property, ...result];
      }
    }
  }
};

const isExist = (value) => {
  return !isNil(value) && !isEmpty(value);
};

module.exports = {
  assocPath,
  constructJSON,
  findPropertyPath,
  isExist,
  removeInvisbleChar,
  toJson,
};
