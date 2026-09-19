const mainCategoryService = require("../services/mainCategoryService");

exports.getAllMainCategories = async (req, res, next) => {
  const mainCategories = await mainCategoryService.getAllMainCategories();
  res.status(200).json({
    success: true,
    results: mainCategories.length,
    data: mainCategories,
  });
};

exports.getMainCategory = async (req, res, next) => {
  const mainCategory = await mainCategoryService.getMainCategory(req.params.id);
  res.status(200).json({
    success: true,
    data: mainCategory,
  });
};

exports.createMainCategory = async (req, res, next) => {
  const mainCategory = await mainCategoryService.createMainCategory(req.body);
  res.status(201).json({
    success: true,
    data: mainCategory,
  });
};

exports.updateMainCategory = async (req, res, next) => {
  const updatedManiCategory = await mainCategoryService.updateMainCategory(
    req.params.id,
    req.body,
  );
  res.status(200).json({
    success: true,
    data: updatedManiCategory,
  });
};

exports.deleteMainCategory = async (req, res, next) => {
  await mainCategoryService.deleteMainCategory(req.params.id);
  res.status(200).json({
    success: true,
    data: null,
  });
};
