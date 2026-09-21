const MainCategory = require("../models/mainCategoryModel");
const factory = require("./handlerFactory");

exports.getAllMainCategories = factory.getAll(MainCategory);

exports.getMainCategory = factory.getOne(MainCategory);

exports.createMainCategory = factory.createOne(MainCategory);

exports.updateMainCategory = factory.updateOne(MainCategory);

exports.deleteMainCategory = factory.deleteOne(MainCategory);