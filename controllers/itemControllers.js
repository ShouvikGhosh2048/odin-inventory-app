const ItemModel = require('../models/itemModel');
const CategoryModel = require('../models/categoryModel');
const { body, validationResult } = require('express-validator');
const async = require('async');

function home(req, res, next) {
    ItemModel.find({})
        .exec((err, items) => {
            if (err) {
                return next(err);
            }
            res.render('items.pug', {
                items,
            });
        });
}

function itemDetail(req, res, next) {
    ItemModel.findById(req.params.id)
            .populate('categories')
            .exec((err, item) => {
                if (err) {
                    return next(err);
                }
                if (!item) {
                    let error = new Error('No such id exists');
                    return next(error);
                }
                res.render('itemDetail.pug', {
                    item,
                });
            })
}

function itemCreateGet(req, res, next) {
    CategoryModel
        .find({})
        .exec((err, categories) => {
            if (err) {
                return next(err);
            }
            res.render('itemForm.pug', {
                categories,
                formType: 'Create',
            });
        });
}

let itemCreatePost = [
    (req, res, next) => {
        if (!Array.isArray(req.body.categories)) {
            if (typeof req.body.categories === 'string') {
                req.body.categories = [req.body.categories];
            }
            else {
                req.body.categories = [];
            }
        }
        next();
    },
    body('name')
        .isString()
        .isLength({
            min: 1,
        })
        .escape()
        .withMessage('Valid name required.'),
    body('description')
        .isString()
        .optional({ checkFalsy: true })
        .escape(),
    body('categories.*')
        .isString()
        .escape(),
    //https://stackoverflow.com/questions/68375006/validate-number-in-express-validator-nodejs
    //https://github.com/validatorjs/validator.js#validators
    body('price')
        .isFloat({
            min: 0,
        })
        .withMessage('Valid price required.'),
    body('numberInStock')
        .isInt({
            min: 0,
        })
        .withMessage('Valid number in stock required.'),
    (req, res, next) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            CategoryModel
                .find({})
                .exec((err, categories) => {
                    if (err) {
                        return next(err);
                    }
                    let inputCategoryIds = new Set();
                    req.body.categories.forEach(category => {
                        inputCategoryIds.add(category);
                    });
                    categories.forEach(category => {
                        category.checked = inputCategoryIds.has(category._id.toString());
                    });
                    res.render('itemForm.pug', {
                        item: req.body,
                        errors: errors.array(),
                        categories,
                        formType: 'Create',
                    });
                });
            return;
        }
        else {
            let item = new ItemModel({
                name: req.body.name,
                description: req.body.description,
                categories: req.body.categories,
                price: req.body.price,
                numberInStock: req.body.numberInStock,
            });
            item.save((err) => {
                if (err) {
                    return next(err);
                }
                res.redirect(item.url);
            });
        }
    }
]

function itemUpdateGet(req, res) {
    async.parallel({
        item(callback) {
            ItemModel
                .findById(req.params.id)
                .exec(callback);
        },
        categories(callback) {
            CategoryModel
            .find({})
            .exec(callback);
        }
    }, (err, results) => {
        if (err) {
            return next(err);
        }
        if (!results.item) {
            let err = new Error('No such item exists.');
            return next(err);
        }

        let {
            item,
            categories
        } = results;

        let itemCategoryIds = new Set();
        item.categories.forEach(category => {
            itemCategoryIds.add(category.toString());
        });
        categories.forEach(category => {
            category.checked = itemCategoryIds.has(category._id.toString());
        });

        res.render('itemForm.pug', {
            item,
            categories,
            formType: 'Update',
        });
    })
}

let itemUpdatePost = [
    (req, res, next) => {
        if (!Array.isArray(req.body.categories)) {
            if (typeof req.body.categories === 'string') {
                req.body.categories = [req.body.categories];
            }
            else {
                req.body.categories = [];
            }
        }
        next();
    },
    body('name')
        .isString()
        .isLength({
            min: 1,
        })
        .escape()
        .withMessage('Valid name required.'),
    body('description')
        .isString()
        .optional({ checkFalsy: true })
        .escape(),
    body('categories.*')
        .isString()
        .escape(),
    //https://stackoverflow.com/questions/68375006/validate-number-in-express-validator-nodejs
    //https://github.com/validatorjs/validator.js#validators
    body('price')
        .isFloat({
            min: 0,
        })
        .withMessage('Valid price required.'),
    body('numberInStock')
        .isInt({
            min: 0,
        })
        .withMessage('Valid number in stock required.'),
    (req, res, next) => {
        async.parallel({
            item(callback) {
                ItemModel
                    .findById(req.params.id)
                    .exec(callback);
            },
            categories(callback) {
                CategoryModel
                    .find({})
                    .exec(callback);
            }
        }, (err, results) => {
            if (err) {
                return next(err);
            }
            if (!results.item) {
                let err = new Error('No such item exists.');
                return next(err);
            }

            let {
                item, 
                categories
            } = results;

            let errors = validationResult(req);
            if (!errors.isEmpty()) {
                let inputCategoryIds = new Set();
                req.body.categories.forEach(category => {
                    inputCategoryIds.add(category);
                });
                categories.forEach(category => {
                    category.checked = inputCategoryIds.has(category._id.toString());
                });
                res.render('itemForm.pug', {
                    item: req.body,
                    errors: errors.array(),
                    categories,
                    formType: 'Update',
                });
                return;
            }
            else {
                item.name =  req.body.name,
                item.description =  req.body.description;
                item.categories =  req.body.categories;
                item.price =  req.body.price;
                item.numberInStock = req.body.numberInStock;
                item.save((err) => {
                    if (err) {
                        return next(err);
                    }
                    res.redirect(item.url);
                });
            }
        });
    }
]

function itemDeleteGet(req, res, next) {
    ItemModel
        .findById(req.params.id)
        .exec((err, item) => {
            if (err) {
                return next(err);
            }

            if (!item) {
                let error = new Error('No such item exists.');
                return next(error);
            }

            res.render('deleteItem.pug', {
                item,
            });
        });
}

function itemDeletePost(req, res, next) {
    ItemModel
        .findById(req.params.id)
        .exec((err, item) => {
            if (err) {
                return next(err);
            }

            if (!item) {
                let error = new Error('No such item exists.');
                return next(err);
            }

            item
                .delete((err) => {
                    if (err) {
                        return next(err);
                    }
                    res.redirect('/item/');
                });
        });
}

module.exports = {
    home,
    itemDetail,
    itemCreateGet,
    itemCreatePost,
    itemUpdateGet,
    itemUpdatePost,
    itemDeleteGet,
    itemDeletePost,
};