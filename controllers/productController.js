const slugify = require("slugify");
const Product = require("../models/productModel");
const Favourite = require("../models/favouriteModel");
const Category = require("../models/categoryModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const { deleteFiles } = require("../utils/deleteFiles");
const ApiFeatures = require("../utils/apiFeatures");

exports.setCategoryFilter = catchAsync(async (req, res, next) => {
  if (req.params.categoryId) {
    req.query.category = req.params.categoryId;
  }
  next();
});

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const filter = {};
  const countDocuments = await Product.countDocuments(filter);
  const features = new ApiFeatures(Product.find(filter).lean(), req.query)
    .filter()
    .sort()
    .limitFields()
    .search()
    .paginate(countDocuments);

  const products = await features.query;
  // No products
  if (products.length === 0) {
    return res.status(200).json({
      status: "success",
      results: 0,
      paginateResult: features.paginateResult,
      data: [],
    });
  }

  // Guest user
  if (!req.user) {
    const productsWithFavorite = products.map((product) => ({
      ...product,
      isFavorite: false,
    }));

    return res.status(200).json({
      status: "success",
      results: productsWithFavorite.length,
      paginateResult: features.paginateResult,
      data: productsWithFavorite,
    });
  }

  // logged in user
  const productsIds = products.map((product) => product._id);

  const favProducts = await Favourite.find({
    user: req.user._id,
    product: { $in: productsIds },
  })
    .select("product")
    .lean();

  const favProductIds = new Set(
    favProducts.map((favourite) => favourite.product.toString()),
  );

  const productsWithFav = products.map((product) => ({
    ...product,
    isFavorite: favProductIds.has(product._id.toString()),
  }));

  res.status(200).json({
    success: true,
    results: productsWithFav.length,
    paginateResult: features.paginateResult,
    data: productsWithFav,
  });
});

exports.getProduct = factory.getOne(Product, "category");

exports.createProduct = catchAsync(async (req, res) => {
  const uploadedFiles = req.files ? req.files.map((file) => file.filename) : [];

  try {
    const category = await Category.findById(req.body.category);
    if (
      !category ||
      !req.body.name ||
      !req.body.description ||
      !req.body.details ||
      !req.body.price ||
      !req.body.stock
    ) {
      throw new AppError("PLEASE_PROVIDE_ALL_THE_REQUIRED_FIELDS", 400);
    }

    const productData = {
      name: req.body.name,
      description: req.body.description,
      details: req.body.details,
      images: uploadedFiles,
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
  } catch (err) {
    await deleteFiles("products", uploadedFiles);
    throw err;
  }
});

exports.updateProduct = catchAsync(async (req, res) => {
  const uploadedFiles = req.files ? req.files.map((file) => file.filename) : [];

  let oldImages = [];

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new AppError("PRODUCT_NOT_FOUND", 404);
    }

    // If category changed
    if (req.body.category !== undefined) {
      const category = await Category.findById(req.body.category);

      if (!category) {
        throw new AppError("CATEGORY_NOT_FOUND", 404);
      }
    }

    const allowedFields = [
      "name",
      "description",
      "details",
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

    if (uploadedFiles.length > 0) {
      oldImages = [...product.images];
      product.images = uploadedFiles;
    }

    await product.save();

    if (oldImages.length > 0) {
      await deleteFiles("products", oldImages);
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    await deleteFiles("products", uploadedFiles);
    throw err;
  }
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError("PRODUCT_NOT_FOUND", 404));
  }

  await deleteFiles("products", product.images);

  res.status(200).json({
    success: true,
    data: null,
  });
});
