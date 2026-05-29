const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express4');
const jwt = require('jsonwebtoken');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const authRoutes = require('./routes/auth.routes');
const casaRoutes = require('./routes/casa.routes');
const visitaRoutes = require('./routes/visita.routes');
const assistidoRoutes = require('./routes/assistido.routes');
const candidaturaRoutes = require('./routes/candidatura.routes');
const adminRoutes = require('./routes/admin.routes');

const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'https://cuidar-mais-sand.vercel.app',
        'https://cuidar-mais-seven.vercel.app',
        'https://cuidar-mais-regismxts-projects.vercel.app'
    ],
    credentials: true,
};

async function createApp() {
    const app = express();

    // Apollo Server precisa ser iniciado antes de ser usado como middleware
    const apolloServer = new ApolloServer({ typeDefs, resolvers });
    await apolloServer.start();

    app.use(helmet({ contentSecurityPolicy: false })); // CSP desativado para o Apollo Sandbox funcionar
    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.get('/', (req, res) => {
        res.json({ message: 'CuidarMais API rodando!' });
    });

    // Rotas REST
    app.use('/api/auth', authRoutes);
    app.use('/api/casas', casaRoutes);
    app.use('/api/visitas', visitaRoutes);
    app.use('/api/assistidos', assistidoRoutes);
    app.use('/api/candidaturas', candidaturaRoutes);
    app.use('/api/admin', adminRoutes);

    // Endpoint GraphQL — lê o token JWT do header e injeta o usuário no context
    app.use(
        '/graphql',
        cors(corsOptions),
        expressMiddleware(apolloServer, {
            context: async({ req }) => {
                const authHeader = req.headers.authorization || '';
                if (authHeader.startsWith('Bearer ')) {
                    const token = authHeader.split(' ')[1];
                    try {
                        const usuario = jwt.verify(token, process.env.JWT_SECRET);
                        return { usuario };
                    } catch {
                        // token inválido — contexto sem usuário (queries públicas continuam funcionando)
                    }
                }
                return { usuario: null };
            },
        })
    );

    return app;
}

module.exports = createApp;