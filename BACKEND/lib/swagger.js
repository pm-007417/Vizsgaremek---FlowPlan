const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FlowPlan API documentation',
            version: '1.0.0',
            description: 'A FlowPlan projektkezelő alkalmazás végpontjainak dokumentációja',
        },
        
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Írja be a JWT tokent a mezőbe (Bearer előtag nélkül)'
                }
            }
        }
    },
    apis: [
        path.join(__dirname, '../controllers/*.js')
    ]
};

const openApiSpecs = swaggerJsdoc(options);

module.exports = openApiSpecs;