const mongoose = require('mongoose');

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
    family: 4
});
        console.log('MongoDB Atlas conectado com sucesso');
    } catch (error) {
        console.error('Erro ao conectar no MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;