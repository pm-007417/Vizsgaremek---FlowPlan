const router = require('express').Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../lib/swagger');
const { notAllowed } = require('../utils/error');

// Swagger UI kiszolgálása a főútvonalon
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDocument));

// Minden más metódus elutasítása ezen az útvonalon
router.all('/', (req, res) => {
    notAllowed(req, res);
});

module.exports = router;