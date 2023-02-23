const express = require('express');
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { User, Spot, SpotImage, Review, ReviewImage, Sequelize, sequelize } = require('../../db/models');
const router = express.Router();
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const validateReviews = [
    check('review')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage("Review text is required"),
    check('stars')
        .exists({ checkFalsy: true })
        .notEmpty()
        .isInt()
        .withMessage("Stars must be an integer from 1 to 5"),
    handleValidationErrors
]

router.get('/current', requireAuth, async (req, res) => {
    const reviews = await Review.findAll({
        where: {
            userId: req.user.id
        },
        include: [
            {
                model: User,
                attributes: { exclude: ['username', 'email', 'hashedPassword', 'createdAt', 'updatedAt'] }
            },
            {
                model: Spot,
                attributes: { exclude: ['createdAt', 'updatedAt'] }
            },
            {
                model: ReviewImage,
                attributes: { exclude: ['createdAt', 'updatedAt', 'reviewId'] }
            },
        ]
    })
    res.json({ Reviews: reviews })
})


router.post('/:reviewId/images', requireAuth, async (req, res) => {
    const reviewId = req.params.reviewId
    const review = await Review.findByPk(reviewId)
    if (req.user.id !== review.userId) {
        return res.status(403).json({
            "message": "Forbidden",
            "statusCode": 403
        })
    }
    if (!review) {
        return res.status(404).json({
            "message": "Review couldn't be found",
            "statusCode": 404
        })
    }
    const totalImages = await ReviewImage.findAll({
        where: {
            reviewid: reviewId
        },
    })

    let picList = []
    for (let images of totalImages) {

        picList.push(images.toJSON())
    }
    if (picList.length >= 10) {
        res.status(403).json({
            "message": "Maximum number of images for this resource was reached",
            "statusCode": 403
        })
    }
    const { url } = req.body
    const images = await ReviewImage.create({ reviewId, url })
    pic = images.toJSON()
    delete pic.reviewId
    delete pic.createdAt
    delete pic.updatedAt
    res.json(pic)
})

router.put('/:reviewId', requireAuth, validateReviews, async (req, res) => {
    const updated = await Review.findByPk(req.params.reviewId)
    if (req.user.id !== updated.userId) {
        return res.status(403).json({
            "message": "Forbidden",
            "statusCode": 403
        })
    }
    if (!updated) {
        return res.status(404).json({
            "message": "Review couldn't be found",
            "statusCode": 404
        })
    }
    const { review, stars } = req.body
    if (review) updated.review = review
    if (stars) updated.stars = stars
    await updated.save()
    res.json(updated)
})

router.delete('/:reviewId', requireAuth, async (req, res) => {

    const rottenReview = await Review.findByPk(req.params.reviewId)
    console.log(rottenReview);
    if (!rottenReview) {
        return res.status(404).json({
            "message": "Review couldn't be found",
            "statusCode": 404
        })
    }
    if (req.user.id !== rottenReview.userId) {
        return res.status(403).json({
            "message": "Forbidden",
            "statusCode": 403
        })
    }
    await rottenReview.destroy()
    res.status(200).json({
        "message": "Successfully deleted",
        "statusCode": 200
    })
})





module.exports = router;