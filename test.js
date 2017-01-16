var nodejieba = require("nodejieba");
var topN = 4;
console.log(nodejieba.extract("升职加薪，当上CEO，走上人生巅峰。", topN));
