const mongoose = require('mongoose');

// mongoose.connect("mongodb://mycl0ud1nd0:pxXBVisls8FES+r1F5xBdw@localhost:27017/mycl0ud1ndo")
//mongoose.connect('mongodb+srv://mycloudindo123:mycloudindo123@cluster0.lvid7bv.mongodb.net/mycloudindo?retryWrites=true&w=majority&appName=Cluster0');
mongoose.connect("mongodb://mycl0ud1nd0:8zWH%2FhHL23cZxsYZNbMBRbOeM3rrE5kaKSlq0%2BqOx4i3zELjePBTjGr7LaTwENzU@195.7.4.115:27017/mycl0ud1ndo")
// mongoose.connect("mongodb://127.0.0.1:27017/mycloudindo")


const db = mongoose.connection;
db.on('error', console.log.bind(console, 'databases connection error'));
db.on('open', () => console.log('databases connection success'));