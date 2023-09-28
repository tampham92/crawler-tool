
const express = require('express')
const router = express.Router()

const crawler = require('../controllers/CrawlerController')

router.get('/', (req, res) => {
  res.send('Hello word')
})

router.get('/crawler/multiplePost', crawler.crawlMultiplePost);
router.get('/crawler/detailPage', crawler.crawlDetailPage);

module.exports = router;