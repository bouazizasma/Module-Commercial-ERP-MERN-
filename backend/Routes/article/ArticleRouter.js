const express =require ("express");
const router = express.Router();
const upload = require('../../Middlewares/multerConfig');
const { getArticles, getArticleByID, createArticle, updateArticle, deleteArticle} = require('../../Controllers/ArticleController');

/**
 * @route   
 * @desc    
 * @access  
 */
router.get('/articles', getArticles);

/**
 * @route   
 * @desc   
 * @access  
 */
router.post('/newA',upload.single('image_article'),createArticle);  

/**
 * @route   
 * @desc    
 * @access  
 */
router.get('/:id', getArticleByID);


/**
 * @route   
 * @desc    
 * @access  
 */
router.put('/:id', updateArticle);

/**
 * @route  
 * @desc    
 * @access  
 */
router.delete('/:id', deleteArticle);

module.exports = router;
