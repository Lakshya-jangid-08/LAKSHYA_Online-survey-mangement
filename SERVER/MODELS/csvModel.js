const mongoose = require('mongoose');

const CSVSchema = new mongoose.Schema({
    // dynamic fields
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    headers: {
        type: [String]
    },
    dataRows: {
        type: [mongoose.Schema.Types.Mixed]
    }
})

module.exports = mongoose.model('CSV', CSVSchema);