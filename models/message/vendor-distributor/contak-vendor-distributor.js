const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'userId harus di isi']
    },
    contact: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'contact harus di isi']
    },
    id_toko: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TokoVendor',
        required: false
    },
    id_pengemudi: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pengemudi',
        required: false
    }
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
