const slugify = require("slugify");
const AppError = require("../utils/appError");
const MainCategory = require("../models/mainCategoryModel");

const formatMainCategory = (mainCategory) => ({
  _id: mainCategory._id,
  name: mainCategory.name,
  image: mainCategory.image,
  description: mainCategory.description,
  slug: mainCategory.slug,
});

exports.getAllMainCategories = async () => {
  const mainCategories = await MainCategory.find();
  return mainCategories.map((mainCategory) => formatMainCategory(mainCategory));
};

exports.getMainCategory = async (id) => {
  const mainCategory = await MainCategory.findById(id);
  return {
    ...formatMainCategory(mainCategory),
  };
};

exports.createMainCategory = async (body) => {
  let { name, image, description } = body;
  if (!name) throw new AppError("Main category name is required", 400);
  const slug = slugify(name, { lower: true, trim: true });
  const mainCategory = await MainCategory.create({
    name,
    image,
    description,
    slug,
  });
  return {
    ...formatMainCategory(mainCategory),
  };
};

exports.updateMainCategory = async (id, body) => {
  if (body.name) {
    slug = slugify(body.name);
  }

  const updatedManiCategory = await MainCategory.findOneAndUpdate(id, body, {
    new: true,
  });
  return {
    ...formatMainCategory(updatedManiCategory),
  };
};

exports.deleteMainCategory = async (id) => {
  const mainCategory = await MainCategory.findById(id);

  if (!mainCategory) {
    throw new AppError("main category not found", 404);
  }

  await MainCategory.findByIdAndDelete(id);

  return null;
};
