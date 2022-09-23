const mongoose = require('mongoose');

let categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: String,
});

categorySchema
    .virtual('url')
    .get(function() {
        return `/category/detail/${this._id}`;
    });

const CategoryModel = mongoose.model('Category', categorySchema);
module.exports = CategoryModel;