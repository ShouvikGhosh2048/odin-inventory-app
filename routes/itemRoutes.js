const express = require('express');
const router = express.Router();
const {
    home,
    itemDetail,
    itemCreateGet,
    itemCreatePost,
    itemUpdateGet,
    itemUpdatePost,
    itemDeleteGet,
    itemDeletePost,
} = require('../controllers/itemControllers');

router.get('/', home);
router.get('/detail/:id/', itemDetail);
router.get('/create/', itemCreateGet);
router.post('/create/', itemCreatePost);
router.get('/update/:id/', itemUpdateGet);
router.post('/update/:id/', itemUpdatePost);
router.get('/delete/:id/', itemDeleteGet);
router.post('/delete/:id/', itemDeletePost);

module.exports = router;