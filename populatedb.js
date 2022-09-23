//https://raw.githubusercontent.com/hamishwillee/express-locallibrary-tutorial/master/populatedb.js
const dotenv = require('dotenv');
dotenv.config();
const async = require('async');
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL);

const ItemModel = require('./models/itemModel');
const CategoryModel = require('./models/categoryModel');

async.parallel({
    electronics(callback) {
        let electronics = new CategoryModel({
            name: 'Electronics',
            description: 'Electronic devices',
        });
        electronics.save((err) => {
            callback(err, electronics);
        });
    },
    computers(callback) {
        let computers = new CategoryModel({
            name: 'Computers',
        });
        computers.save((err) => {
            callback(err, computers);
        });
    },
    clothes(callback) {
        let clothes = new CategoryModel({
            name: 'Clothes',
        });
        clothes.save((err) => {
            callback(err, clothes);
        });
    }
}, (err, res) => {
    if (err) {
        mongoose.connection.close();
        return;
    }
    else {
        let { electronics, computers, clothes } = res;
        async.parallel({
            computer(callback) {
                let computer = new ItemModel({
                    name: 'Computer #1',
                    categories: [electronics._id, computers._id],
                    price: 1000,
                    numberInStock: 10,
                });
                computer.save((err) => {
                    callback(err, computer);
                });
            },
            shirt(callback) {
                let shirt =  new ItemModel({
                    name: 'Shirt #1',
                    categories: [clothes._id],
                    price: 100,
                    numberInStock: 200,
                });
                shirt.save((err) => {
                    callback(err, shirt);
                });
            }
        }, (err, res) => {
            mongoose.connection.close();
        });
    }
});