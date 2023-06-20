const express = require("express");
const router = express.Router();
const app = express();
const { model } = require("mongoose");
const mongoose = require("mongoose");
const Beat = require("../models/beat");
const multer = require("multer");
const PaidBeat = require("../models/paidBeat_schema");

const path = require("path");
const paidBeat_schema = require("../models/paidBeat_schema");
const cloudinary = require("cloudinary").v2;
app.use("/beats", express.static("./upload/freebeats"));

cloudinary.config({
  cloud_name: "dyabowhkn",
  api_key: "119218244742822",
  api_secret: "eqzjre-21ikeaEYO4EDlRp3kzzI",
});

const storage = multer.diskStorage({
  destination: "./upload/freebeats",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});
const upload = multer({
  storage: storage,
});

router.post("/postPaidBeat", (req, res) => {
  const beat = new paidBeat_schema({
    _id: new mongoose.Types.ObjectId(),
    beatName: req.body.beatName,
    producerName: req.body.producerName,
    beatUrl: req.body.beatUrl,
    price: req.body.price,
    sampleUrl: req.body.sampleUrl,
  });
  beat
    .save()
    .then((result) => {
      res.status(200).json({
        message: "Beat Uploaded Sucesfully",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: "Internal Server Error",
      });
    });
});

router.get("/getPaidBeats", (req, res) => {
  PaidBeat.find()
    .then((paidBeat) => {
      res.json({ paidBeat });
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal Server Error" });
    });
});

router.get("/getBeats", (req, res) => {
  Beat.find()
    .then((beats) => {
      res.json({ beats });
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal Server Error" });
    });
});

router.post("/postBeat", (req, res) => {
  upload.single("beats")(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred during file upload
      return res.status(400).json({ msg: "Error uploading file" });
    } else if (err) {
      // An unknown error occurred
      console.log(err);
      return res.status(500).json({ msg: "Internal Server Error" });
    }

    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const cloudinaryResult = await cloudinary.uploader
      .upload(`./upload/freebeats/${req.file.filename}`, {
        resource_type: "raw",
        public_id: `AudioUploads/${req.file.filename}`,
      })
      .catch((error) => {
        console.error(error.message);
        return res
          .status(500)
          .json({ msg: "Internal Server Error", error: error.message });
      });

    res.status(200).json({
      msg: "Upload successfully",
      beatUrl: cloudinaryResult.secure_url,
    });
  });
});

router.post("/uploadBeat", (req, res, next) => {
  const beat = new Beat({
    _id: new mongoose.Types.ObjectId(),
    beatName: req.body.beatName,
    producerName: req.body.producerName,
    beatUrl: req.body.beatUrl,
    price: req.body.price,
  });
  beat
    .save()
    .then((result) => {
      res.status(200).json({
        message: "Beat Uploaded Sucesfully",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: "Internal Server Error",
      });
    });
});

router.get("/getFreeBeats");

module.exports = router;
