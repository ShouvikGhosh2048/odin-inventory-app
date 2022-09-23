const CategoryModel = require('../models/categoryModel')
const ItemModel = require('../models/itemModel')
const async = require('async')
const { body, validationResult } = require('express-validator');

function categories(req, res, next) {
    CategoryModel
        .find({})
        .exec((err, categories) => {
            if (err) {
                return next(err);
            }
            res.render('categories.pug', {
                categories
            });
        })
}

function categoryDetail(req, res, next) {
    async
        .parallel({
            category(callback) {
                CategoryModel
                    .findById(req.params.id)
                    .exec(callback)
            },
            items(callback) {
                //https://stackoverflow.com/a/18148872
                //https://www.mongodb.com/docs/manual/tutorial/query-arrays/
                ItemModel
                    .find({})
                    .where('categories')
                    .all([req.params.id])
                    .exec(callback)
            }
        }, (err, results) => {
            if (err) {
                return next(err);
            }

            let { category, items } = results;
            if (!category) {
                let error = new Error('No such category exists.');
                return next(error);
            }
            res.render('categoryDetail.pug', {
                category,
                items,
            });
        })
}

function categoryCreateGet(req, res) {
    res.render('createCategory.pug');
}

let categoryCreatePost = [
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
        .escape()
        .withMessage('Valid description required.'),
    (req, res, next) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('createCategory.pug', {
                category: req.body,
                errors: errors.array(),
            });
        }
        else {
            let category = new CategoryModel({
                name: req.body.name,
                description: req.body.description,
            });
            category
                .save((err) => {
                    if (err) {
                        return next(err);
                    }
                    res.redirect(category.url);
                });
        }
    }
];

module.exports = {
    categories,
    categoryDetail,
    categoryCreateGet,
    categoryCreatePost,
};