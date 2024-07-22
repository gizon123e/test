const PelacakanDistributorToko = require('../models/distributor/pelacakanDistributorToko');
const PelacakanDistributorKonsumen = require('../models/distributor/pelacakanDistributorKonsumen');

const updateDistributorTokoLocation = async (data) => {
  const { id_distributor, id_toko, latitude, longitude } = data;
  const updatedLocation = await PelacakanDistributorToko.findOneAndUpdate(
    { id_distributor, id_toko },
    { latitude, longitude },
    { new: true, upsert: true, runValidators: true }
  );
  return updatedLocation;
};

const updateDistributorKonsumenLocation = async (data) => {
  const { id_distributor, id_address, latitude, longitude } = data;
  const updatedLocation = await PelacakanDistributorKonsumen.findOneAndUpdate(
    { id_distributor, id_address },
    { latitude, longitude },
    { new: true, upsert: true, runValidators: true }
  );
  return updatedLocation;
};

const initSocketIo = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('locationUpdateToko', async (data) => {
      try {
        const updatedLocation = await updateDistributorTokoLocation(data);
        io.emit('locationUpdateToko', updatedLocation);
      } catch (error) {
        console.error('Error updating Toko location:', error);
      }
    });

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
