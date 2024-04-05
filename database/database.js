const mongoose = require('mongoose')

mongoose.connect('mongodb://0.0.0.0:27017/myCloudIndonesia')

const db = mongoose.connection

db.on('error', console.log.bind(console, 'databases connection error'))
db.on('open', () => console.log('databases connection success'))