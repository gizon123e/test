const mongoose = require('mongoose')

// mongoose.connect('mongodb+srv://mycloudindo123:mycloudindo123@cluster0.lvid7bv.mongodb.net/mycloudindo?retryWrites=true&w=majority&appName=Cluster0')
mongoose.connect('mongodb://0.0.0.0:27017/myCloudIndo')

const db = mongoose.connection

db.on('error', console.log.bind(console, 'databases connection error'))
db.on('open', () => console.log('databases connection success'))