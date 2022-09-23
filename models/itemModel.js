const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: String,
    categories: {
        type: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Category'}],
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    numberInStock: {
        type: Number,
        required: true,
        min: 0,
    },
});

itemSchema
    .virtual('url')
    .get(function() {
        return `/item/detail/${this._id}`;
    });

itemSchema
    .virtual('updateUrl')
    .get(function() {
        return `/item/update/${this._id}`;
    });

itemSchema
    .virtual('deleteUrl')
    .get(function() {
        return `/item/delete/${this._id}`;
    });

const ItemModel = mongoose.model('Item', itemSchema);
module.exports = ItemModel;