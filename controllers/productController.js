const slugify = require("slugify");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getAllProducts = factory.getAll(Product);

exports.getProduct = factory.getOne(Product, "category");

exports.createProduct = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.body.category);
  if (!category) {
    return next(new AppError("CATEGORY_NOT_FOUND", 404));
  }

  const productData = {
    name: req.body.name,
    description: req.body.description,
    details: req.body.details,
    images: req.files.map((file) => file.filename),
    price: req.body.price,
    discountPrice: req.body.discountPrice,
    category: req.body.category,
    stock: req.body.stock,
    isActive: req.body.isActive,
  };

  productData.slug = slugify(req.body.name, {
    lower: true,
    strict: true,
    trim: true,
  });

  const product = await Product.create(productData);

  res.status(201).json({
    status: "success",
    data: product,
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("PRODUCT_NOT_FOUND", 404));
  }

  // If category changed
  if (req.body.category !== undefined) {
    const category = await Category.findById(req.body.category);

    if (!category) {
      return next(new AppError("CATEGORY_NOT_FOUND", 404));
    }
  }

  const allowedFields = [
    "name",
    "description",
    "details",
    "images",
    "price",
    "discountPrice",
    "category",
    "stock",
    "isActive",
  ];

  // Update allowed fields only
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });

  // Update slug if product name changed
  if (req.body.name !== undefined) {
    product.slug = slugify(req.body.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }

  await product.save();

  res.status(200).json({
    status: "success",
    data: product,
  });
});

exports.deleteProduct = factory.deleteOne(Product);
