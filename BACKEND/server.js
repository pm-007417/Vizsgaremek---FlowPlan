const express = require('express');

// route-k importálása
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const corsMiddleWare = require('./middlewares/cors');
const { notFoundHandler, serverErrorHandler } = require('./middlewares/errorHandler');
const swaggerRoutes = require('./routes/swaggerRoutes');

// portszám
const port = 3000;

// express szerver
const app = express();
app.use(express.json());

// cors beállítások
app.use(corsMiddleWare);

// routes
app.use("/api/felhasznalok", userRoutes);
app.use("/api/tarsasagok", companyRoutes);
app.use("/api/projektek", projectRoutes);
app.use("/api/feladatok", taskRoutes);
app.use('/api/docs', swaggerRoutes);

// hibakezelő
app.use(notFoundHandler);

// hibakezelő adatbázis hibákhpz
app.use(serverErrorHandler);

app.listen(port, () => {
    console.log(`Szerver elindult a http://localhost:${port} címen`);
})