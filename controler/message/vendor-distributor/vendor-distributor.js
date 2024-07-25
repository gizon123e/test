const Message = require('../../../models/message/vendor-distributor/distributor-vendor-chat');
const Contact = require('../../../models/message/vendor-distributor/contak-vendor-distributor');

const initializeChatSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected');

        // When a user joins, they join a specific room based on their contacts
        socket.on('join', async ({ userId }) => {
            try {
                const contacts = await Contact.find({ userId }).populate('contact').populate('id_toko');
                contacts.forEach(contact => {
                    const room = `${userId}-${contact.contact._id}-${contact.id_toko}`;
                    socket.join(room);
                    console.log(`User ${userId} joined room ${room}`);
                });
            } catch (error) {
                console.error('Error fetching contacts:', error);
            }
        });

        // Handle message sending
        socket.on('sendMessage', async ({ sender, receiver, message, tokoId }) => {
            try {
                const newMessage = new Message({ sender, receiver, message });
                await newMessage.save();

                const room = `${sender}-${receiver}-${tokoId}`;
                io.to(room).emit('receiveMessage', newMessage);
            } catch (error) {
                console.error('Error sending message:', error);
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });
};

module.exports = initializeChatSocket;
