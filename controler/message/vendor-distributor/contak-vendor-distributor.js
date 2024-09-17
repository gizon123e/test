const Contact = require('../../../models/message/vendor-distributor/contak-vendor-distributor');
const User = require('../../../models/model-auth-user'); // Assuming you have a User model
const TokoVendor = require('../../../models/vendor/model-toko'); // Assuming you have a TokoVendor model

// Create or update a contact
const createOrUpdateContact = async (req, res) => {
    try {
        const { userId, contactId, tokoId, id_pengemudi } = req.body;

        if (!userId || !contactId || !tokoId) {
            return res.status(400).json({ message: 'userId, contactId, and tokoId are required' });
        }

        // Check if the contact already exists
        let contact = await Contact.findOne({ userId, contact: contactId, id_toko: tokoId, id_pengemudi });

        if (contact) {
            return res.status(200).json({ message: 'Contact already exists', contact });
        }

        // Check if user and contact are valid
        const user = await User.findById(userId);
        const contactUser = await User.findById(contactId);
        const toko = await TokoVendor.findById(tokoId);

        if (!user || !contactUser || !toko) {
            return res.status(404).json({ message: 'User, contact or toko not found' });
        }

        // Create a new contact
        contact = new Contact({ userId, contact: contactId, id_toko: tokoId });
        await contact.save();

        res.status(201).json({ message: 'Contact created successfully', contact });
    } catch (error) {
        console.log(error)
        if (error && error.name === 'ValidationError') {
            return res.status(400).json({
                error: true,
                message: error.message,
                fields: error.fields
            })
        }
        next(error)
    }
};

// Fetch contacts for a user
const getContacts = async (req, res) => {
    try {
        const { userId, id_toko } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        const contacts = await Contact.find({ userId }).populate('contact').populate('id_toko');

        res.status(200).json({
            message: "get All data success",
            contacts
        });
    } catch (error) {
        console.log(error)
        if (error && error.name === 'ValidationError') {
            return res.status(400).json({
                error: true,
                message: error.message,
                fields: error.fields
            })
        }
        next(error)
    }
};

module.exports = {
    createOrUpdateContact,
    getContacts
};
