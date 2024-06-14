const mongoose = require('mongoose');

// mongoose.connect("mongodb://dev_mycloudindo:OFN1LmrseubCgYw@195.7.4.115:27017/mycloudindo")
mongoose.connect('mongodb+srv://mycloudindo123:mycloudindo123@cluster0.lvid7bv.mongodb.net/mycloudindo?retryWrites=true&w=majority&appName=Cluster0');
// mongoose.connect('mongodb://0.0.0.0:27017/mycloudindo')

const db = mongoose.connection;
db.on('error', console.log.bind(console, 'databases connection error'));
db.on('open', () => console.log('databases connection success'));