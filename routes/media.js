const express = require('express');
const router = express.Router();
const isBase64 = require('is-base64');
const base54Img = require('base64-img');
const fs = require('fs');

const {HOSTNAME} = process.env;

const {Media} = require('../models');

router.get('/', async (req, res) => {
  const media = await Media.findAll({
    attributes: ['id', 'image']
  });

  const mappedMedia = media.map((m)=>{
    m.image = `${HOSTNAME}/${m.image}`;
    return m;
  })

  return res.json({
    status: 'success',
    data: mappedMedia
  })
});

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
        image: `${HOSTNAME}/images/${filename}`
      }
    })
  });
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id;

  const media = await Media.findByPk(id);

  if(!media){
    return res.status(404).json({
      status: 'error',
      message: 'media not found'
    });
  }

  fs.unlink(`./public/${media.image}`, async (err) => {
    if(err){
      return res.status(400).json({
        status: 'error',
        message: err.message
      })
    }

    await media.destroy();

    return res.json({
      status: 'success',
      message: 'media deleted successfully'
    })
  })
})

module.exports = router;
