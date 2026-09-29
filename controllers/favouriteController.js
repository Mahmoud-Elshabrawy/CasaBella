const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const Favourite = require("../models/favouriteModel");
const Product = require("../models/productModel");

exports.getMyFavourite = catchAsync(async (req, res, next) => {
  const favourites = await Favourite.find({ user: req.user._id }).populate({
    path: "product",
    select: "name images price description ",
  });
  res.status(200).json({
    success: true,
    data: favourites,
  });
});

exports.addToFavourite = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new AppError("PRODUCT_NOT_FOUND", 404));
  }

  // check product is already in fav
  const existisFav = await Favourite.findOne({ user: req.user._id, product });
  if (existisFav) {
    return next(new AppError("ALREADY_IN_FAVOURITE", 400));
  }

  const favourite = await Favourite.create({
    user: req.user._id,
    product: product._id,
  });

  res.status(201).json({
    success: true,
    data: favourite,
  });
});

exports.removeFromFavourite = catchAsync(async (req, res, next) => {
    const favourite = await Favourite.findOne({user: req.user._id, product: req.params.id});
    if(!favourite){
        return next(new AppError(" FAVOURITE_NOT_FOUND",404));
    }
    await favourite.deleteOne();
    res.status(204).json({
        success:true,
        data:null,
    });
});
