const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

const AppError = require("../utils/appError");
const ApiFeatures = require("../utils/apiFeatures");

exports.getAll = (Model) =>
  asyncHandler(async (req, res) => {
    const filter = {};

    const documentCounts = await Model.countDocuments(filter);

    const features = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .search()
      .paginate(documentCounts);

    const documents = await features.query;

    res.status(200).json({
      status: "success",
      results: documents.length,
      paginateResult: features.paginateResult,
      data: documents,
    });
  });

exports.getOne = (Model, populateOpt) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    let query = Model.findById(id);

    if (populateOpt) {
      query = query.populate(populateOpt);
    }

    const document = await query;

    if (!document) {
      return next(new AppError(`No document found with this ID: ${id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: document,
    });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const hasSlug = Model.schema.path("slug");
    if (hasSlug) {
      const value = req.body.name || req.body.title;

      if (value) {
        req.body.slug = slugify(value, {
          lower: true,
          trim: true,
        });
      }
    }

    const document = await Model.create(req.body);
    res.status(201).json({
      success: true,
      data: document,
    });
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const hasSlug = Model.schema.path("slug");

    if (hasSlug) {
      const value = req.body.name || req.body.title;

      if (value) {
        req.body.slug = slugify(value, {
          lower: true,
          trim: true,
        });
      }
    }

    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!document) {
      return next(
        new AppError(`No document found with this ID: ${req.params.id}`, 404),
      );
    }

    res.status(200).json({
      success: true,
      data: document,
    });
  });

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const document = await Model.findByIdAndDelete(id);

    if (!document) {
      return next(new AppError(`No document found with this ID: ${id}`, 404));
    }
    res.status(204).send();
  });
