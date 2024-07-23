const PelacakanDistributorKonsumen = require('../models/distributor/pelacakanDistributorKonsumen');

const updateDistributorKonsumenLocation = async (data) => {
  const { id_toko, id_address, latitude, longitude } = data;
  const updatedLocation = await PelacakanDistributorKonsumen.findOneAndUpdate(
    { id_toko, id_address },
    { latitude, longitude },
    { new: true, upsert: true, runValidators: true }
  );
  return updatedLocation;
};

const initSocketIo = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('locationUpdateKonsumen', async (data) => {
      try {
        const updatedLocation = await updateDistributorKonsumenLocation(data);
        io.emit('locationUpdateKonsumen', updatedLocation);
      } catch (error) {
        console.error('Error updating Konsumen location:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};

module.exports = initSocketIo;
