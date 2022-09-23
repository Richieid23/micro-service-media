const express = require('express');
const router = express.Router();
const isBase64 = require('is-base64');
const base54Img = require('base64-img');

const {Media} = require('../models');

router.post('/', function(req, res) {
  const image = req.body.image;

  if(!isBase64(image, {mimeRequired: true})){
    return res.status(404).json({
      "status": "error",
      "message": "invalid base64"
    });
  }

  base54Img.img(image, './public/images', Date.now(), async (err, filepath) => {
    if(err){
      return res.status(400).json({
        "status": "error",
        "message": err.message
      });
    }

    const filename = filepath.split("\\").pop();

    const media = await Media.create({image: `images/${filename}`});

    return res.json({
      status: 'success',
      data: {
        media: media.id,
        image: `${req.get('host')}/images/${filename}`
      }
    })
  });
});

module.exports = router;
