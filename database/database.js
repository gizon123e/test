const mongoose = require('mongoose')

<<<<<<< HEAD
mongoose.connect('mongodb://0.0.0.0:27017/myCloudIndonesia')
=======
mongoose.connect('mongodb+srv://mycloudindo123:mycloudindo123@cluster0.lvid7bv.mongodb.net/mycloudindo?retryWrites=true&w=majority&appName=Cluster0')
>>>>>>> b5a31a26557174393446f828752b57d536e79998

const db = mongoose.connection

db.on('error', console.log.bind(console, 'databases connection error'))
<<<<<<< HEAD
db.on('open', () => console.log('databases connection success'))
=======
db.on('open', () => console.log('databases connection success'))
>>>>>>> b5a31a26557174393446f828752b57d536e79998
