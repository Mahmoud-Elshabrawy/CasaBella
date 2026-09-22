const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

exports.getMyCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path: "cartItems.product",
    select: "name images price discountPrice",
  });
  if (!cart) {
    return next(new AppError("YOU_DON'T_HAVE_A_CART_YET", 404));
  }

  let totalPrice = 0;

  const cartItems = cart.cartItems.map((item) => {
    const product = item.product;
    if (product.discountPrice) {
      totalPrice += (product.price - product.discountPrice) * item.quantity;
    } else {
      totalPrice += product.price * item.quantity;
    }
    return {
      ...item.toObject(),
      product,
      totalPrice,
    };
  });

  res.status(200).json({
    success: true,
    data: {
      cartItems,
      totalPrice,
    },
  });
});

exports.addToCart = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    return next(new AppError("PRODUCT_NOT_FOUND", 404));
  }

  if (!product.isAvailable) {
    return next(new AppError("PRODUCT_IS_NOT_AVAILABLE", 404));
  }

  if (product.stock <= 0) {
    return next(new AppError("PRODUCT_IS_OUT_OF_STOCK", 404));
  }

  let cart = await Cart.findOne({
    user: req.user._id,
  });

  // user doesn't have cart yet
  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [
        {
          product: product._id,
        },
      ],
    });
  } else {
    // user has a cart
    // check if the product already in the cart
    const existisProduct = await cart.cartItems.find(
      (item) => item.product.toString() === product._id.toString(),
    );

    if (existisProduct) {
      return next(new AppError("PRODUCT_IS_ALREADY_IN_CART", 400));
    } else {
      cart.cartItems.push({
        product: product._id,
      });
    }

    await cart.save();
  }

  await cart.populate({
    path: "cartItems.product",
    select: "name images price discountPrice",
  });
  res.status(201).json({
    success: true,
    data: cart,
  });
});

exports.updateProductQuantity = catchAsync(async (req, res, next) => {
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1) {
    return next(new AppError("INVALID_QUANTITY", 400));
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new AppError("CART_NOT_FOUND", 404));
  }

  const cartItem = cart.cartItems.find(
    (item) => item.product.toString() === req.params.productId.toString(),
  );

  if (!cartItem) {
    return next(new AppError("PRODUCT_NOT_IN_CART", 404));
  }

  const product = await Product.findById(req.params.productId);
  if (!product) {
    return next(new AppError("PRODUCT_NOT_FOUND", 404));
  }

  if (!product.isAvailable || !product.isActive) {
    return next(new AppError("PRODUCT_IS_NOT_AVAILABLE", 404));
  }
  if (quantity > product.stock) {
    return next(new AppError("PRODUCT_QUANTITY_EXCEEDS_STOCK", 400));
  }
  cartItem.quantity = quantity;
  await cart.save();

  await cart.populate({
    path: "cartItems.product",
    select: "name image price discountPrice",
  });
  res.status(200).json({
    success: true,
    data: cart,
  });
});

exports.removeFromCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new AppError("CART_NOT_FOUND", 404));
  }

  const cartItemIdx = cart.cartItems.findIndex(
    (item) => item.product.toString() === req.params.productId.toString(),
  );

  if (cartItemIdx === -1) {
    return next(new AppError("PRODUCT_NOT_IN_CART", 404));
  }

  cart.cartItems.splice(cartItemIdx, 1);
  await cart.save();

  res.status(200).json({
    success: true,
    data: cart,
  });
});

exports.clearCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(200).json({
      success: true,
      data: {
        cartItems: [],
        totalPrice: 0,
      },
    });
  }

  cart.cartItems = [];
  await cart.save();

  res.status(200).json({
    success: true,
    message: 'CART_CLEARED',
    data: {
      cartItems: [],
      totalPrice: 0,
    },
  });
});
