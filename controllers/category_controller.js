const Category = require("../models/Category");
const Item = require("../models/Item");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.category_list = asyncHandler(async (req, res, next) => {
  const category_list = await Category.find({}, "name")
    .sort({ name: 1 })
    .exec();
  res.render("category_list", { title: "Category List", category_list });
});

exports.category_detail = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id)
    .populate("items")
    .exec();

  if (category === null) {
    const err = new Error("Category not found");
    err.status = 404;
    return next(err);
  }
  res.render("category_detail", {
    title: category.name,
    category,
  });
});
exports.category_create_get = asyncHandler(async (req, res, next) => {
  res.render("category_form", { title: "Add Category" });
});
exports.category_create_post = [
  // validate & sanitize
  body("name", "Category name must contain at least 3 characters.")
    .trim()
    .isLength({ min: 3, max: 50 })
    .escape(),
  body(
    "description",
    "Category description must contain at least 5 characters."
  )
    .trim()
    .isLength({ min: 5 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });
    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Add Category",
        category,
        errors: errors.array(),
      });
      return;
    } else {
      const categoryExists = await Category.findOne({
        name: req.body.name,
      }).exec();
      if (categoryExists) {
        res.redirect(genreExits.url);
      } else {
        await category.save();
        res.redirect(category.url);
      }
    }
  }),
];
exports.category_delete_get = asyncHandler(async (req, res, next) => {
  const [category, category_items] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, "name nis").exec(),
  ]);

  if (category === null) {
    res.redirect("/categories");
  }

  res.render("category_delete", {
    title: "Delete Category",
    category,
    category_items,
  });
});
exports.category_delete_post = [
  body("pass", "you must enter the password for deletion")
    .escape()
    .equals(process.env.PASS),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const [category, category_items] = await Promise.all([
      Category.findById(req.params.id).exec(),
      Item.find({ category: req.params.id }, "name").exec(),
    ]);

    if (category_items.length > 0 || !errors.isEmpty()) {
      res.render("category_delete", {
        title: "Delete Category",
        category,
        category_items,
        errors: errors.array(),
      });
      return;
    } else if (req.body.pass == process.env.PASS) {
      await Category.findByIdAndDelete(req.body.category_id);
      res.redirect("/categories");
    }
  }),
];
exports.category_update_get = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).exec();

  if (category === null) {
    const err = new Error("Category not found");
    err.status = 404;
    return next(err);
  }

  res.render("category_form", { title: "Update category", category });
});
exports.category_update_post = [
  body("name", "Category name must contain at least 3 characters.")
    .trim()
    .isLength({ min: 3, max: 50 })
    .escape(),
  body(
    "description",
    "Category description must contain at least 5 characters."
  )
    .trim()
    .isLength({ min: 5 })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const old_category = await Category.findById(req.params.id);
    const category = new Category({
      _id: req.params.id,
      name: req.body.name,
      description: req.body.description,
      items: old_category.items,
    });
    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Update Category",
        category,
        errors: errors.array(),
      });
      return;
    } else {
      const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        category,
        {}
      );
      res.redirect(updatedCategory.url);
    }
  }),
];
