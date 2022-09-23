const express = require('express');
const router = express.Router();
const {
    categories,
    categoryDetail,
    categoryCreateGet,
    categoryCreatePost
} = require('../controllers/categoryControllers');

router.get('/', categories);
router.get('/detail/:id/', categoryDetail);
router.get('/create/', categoryCreateGet);
router.post('/create/', categoryCreatePost);

module.exports = router;