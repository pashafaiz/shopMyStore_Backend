// const mongoose = require('mongoose');

// const reelSchema = new mongoose.Schema({
//   videoUrl: {
//     type: String,
//     required: true
//   },
//   caption: {
//     type: String,
//     default: ''
//   },
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model('Reel', reelSchema);



const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
  videoUrl: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    default: '',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Reel', reelSchema);