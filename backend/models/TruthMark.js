const mongoose = require('mongoose');

const truthMarkSchema = new mongoose.Schema({
  truthMarkCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  artisanName: {
    type: String,
    required: true
  },
  village: {
    type: String,
    required: true
  },
  gpsCoords: {
    lat: { type: Number },
    lng: { type: Number }
  },
  craftType: {
    type: String,
    required: true
  },
  story: {
    type: String,
    default: ''
  },
  photoIPFS: {
    type: String,
    default: ''
  },
  videoIPFS: {
    type: String,
    default: ''
  },
  qrCodePath: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('TruthMark', truthMarkSchema);
