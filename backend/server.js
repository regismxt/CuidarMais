require('dns').setDefaultResultOrder('ipv4first');
const createApp = require('./src/app');
const connectDB = require('./src/config/db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

async function start() {
    await connectDB();
    const app = await createApp();
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
        console.log(`GraphQL disponível em http://localhost:${PORT}/graphql`);
    });
}

start();