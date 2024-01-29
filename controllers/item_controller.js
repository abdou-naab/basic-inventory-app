require("dotenv").config();
const Item = require("../models/Item");
const Category = require("../models/Category");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { DateTime } = require("luxon");

exports.item_list = asyncHandler(async (req, res, next) => {
  const item_list = await Item.find({}, "name category")
    .sort({ name: 1 })
    .populate("category")
    .exec();
  res.render("item_list", { title: "Item List", item_list });
});
exports.item_detail = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).populate("category").exec();

  if (item == null) {
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }
  res.render("item_detail", {
    title: item.name,
    item,
  });
});
exports.item_create_get = asyncHandler(async (req, res, next) => {
  const categories = await Category.find().sort({ name: 1 }).exec();

  res.render("item_form", { title: "Add Item", categories });
});
exports.item_create_post = [
  body("name", "Item name must contain at least 3 characters.")
    .trim()
    .isLength({ min: 3, max: 80 })
    .escape(),
  body("description", "Item description must contain at least 5 characters.")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 3, max: 500 })
    .escape(),
  body("price").optional({ values: "falsy" }).trim().escape(),
  body("nis").trim().escape(),
  body("d_added", "Invalid date").isISO8601().toDate(),
  body("category").escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const today = DateTime.fromJSDate(Date()).toISODate();
    const item = new Item({
      name: req.body.name,
      nis: req.body.nis,
      category: req.body.category,
      d_added: req.body.d_added,
      description: req.body.description,
      price: req.body.price,
    });
    if (!errors.isEmpty()) {
      const categories = await Category.find().sort({ name: 1 }).exec();
      res.render("item_form", {
        title: "Add Item",
        item,
        categories,
        errors: errors.array(),
        today,
      });
    } else {
      await item.save();
      res.redirect(item.url);
    }
  }),
];
exports.item_delete_get = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).exec();
  if (item == null) {
    res.redirect("/items");
  }
  res.render("item_delete", {
    title: "Delete Item",
    item,
  });
});
exports.item_delete_post = [
  body("pass", "you must enter the password for deletion")
    .escape()
    .equals(process.env.PASS),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const item = await Item.findById(req.params.id).exec();
    if (item == null) {
      res.redirect("/items");
    }
    if (req.body.pass == process.env.PASS) {
      await Item.findByIdAndDelete(req.body.item_id);
      res.redirect("/items");
    } else if (!errors.isEmpty()) {
      res.render("item_delete", {
        title: "Delete Item",
        item,
        errors: errors.array(),
      });
      return;
    }
  }),
];
exports.item_update_get = asyncHandler(async (req, res, next) => {
  const [item, categories] = await Promise.all([
    Item.findById(req.params.id).exec(),
    Category.find({}).exec(),
  ]);
  if (item === null) {
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }
  res.render("item_form", { title: "Update Item", item, categories });
});
exports.item_update_post = [
  body("name", "Item name must contain at least 3 characters.")
    .trim()
    .isLength({ min: 3, max: 80 })
    .escape(),
  body("description", "Item description must contain at least 5 characters.")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 3, max: 500 })
    .escape(),
  body("price").optional({ values: "falsy" }).trim().escape(),
  body("nis").trim().escape(),
  body("d_added", "Invalid date").isISO8601().toDate(),
  body("category").escape(),

  // .equals(process.env.PASS),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const item = new Item({
      _id: req.params.id,
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      nis: req.body.nis,
      d_added: req.body.d_added,
    });
    if (!errors.isEmpty()) {
      res.render("item_form", {
        title: "Update Item",
        item,
        errors: errors.array(),
      });
      return;
    } else {
      const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {});
      res.redirect(updatedItem.url);
    }
  }),
];
