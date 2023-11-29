exports.StringHandler = class StringHandler {
  static toCamelCase(str) {
    const words = str.split(" ");
    let camelCaseStr = words[0].toLowerCase();
    for (let i = 1; i < words.length; i++) {
      camelCaseStr += words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
    }
    return camelCaseStr;
  }
};
