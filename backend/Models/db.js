const mongoose = require('mongoose');

//const mongo_url = process.env.MONGO_CONN;

const mongo_url="mongodb://127.0.0.1:27017/myprojecttest1";
mongoose.connect(mongo_url)
    .then(() => {
        console.log('MongoDB Connected...');
    }).catch((err) => {
        console.log('MongoDB Connection Error: ', err);
    })