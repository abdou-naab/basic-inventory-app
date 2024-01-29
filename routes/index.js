var express = require("express");
var router = express.Router();

const Item = require("../models/Item");
const Category = require("../models/Category");

const asyncHandler = require("express-async-handler");

const index_controller = asyncHandler(async (req, res, next) => {
  const [numItems, numCategories] = await Promise.all([
    Item.countDocuments({}).exec(),
    Category.countDocuments({}).exec(),
  ]);
  res.render("index", {
    title: "Your inventory",
    item_count: numItems,
    category_count: numCategories,
  });
});

/* GET home page. */
router.get("/", index_controller);

module.exports = router;
