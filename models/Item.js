const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { DateTime } = require("luxon");

const itemSchema = new Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 80 },
  description: { type: String, minLength: 5, maxLength: 500 },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  price: { type: Number },
  nis: { type: Number, required: true },
  d_added: { type: Date, default: Date.now },
});

itemSchema.virtual("url").get(function () {
  return "/items/" + this._id;
});
itemSchema.virtual("date_added").get(function () {
  return this.d_added
    ? DateTime.fromJSDate(this.d_added).toLocaleString(DateTime.DATE_MED)
    : "";
});
itemSchema.virtual("d_added_yyyy_mm_dd").get(function () {
  return DateTime.fromJSDate(this.d_added).toISODate(); // format 'YYYY-MM-DD'
});
module.exports = mongoose.model("Item", itemSchema);
