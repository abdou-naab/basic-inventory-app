const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  items: [{ type: Schema.Types.ObjectId, ref: "Item" }],
});

categorySchema.virtual("url").get(function () {
  return "/categories/" + this._id;
});
// itemSchema.method("myInstanceMethod", function () {
//   console.log(this);
// });
// itemSchema.static({
//     findByName: function(name) { return this.find({ name });}
// })
// can add Query Helpers

module.exports = mongoose.model("Category", categorySchema);
