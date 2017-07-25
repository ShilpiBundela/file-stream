const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const feathers = require('feathers');
const configuration = require('feathers-configuration');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');

const handler = require('feathers-errors/handler');
const notFound = require('feathers-errors/not-found');

const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');

const sendFile = require('../shared-services/file-stream.service');
const fileDetails = require('../shared-services/file-details.service');
const app = feathers();

// Directory constants
const SERVE_DIRECTORY = '../SERVE_FILES';
// Load app configuration
app.configure(configuration());
// Enable CORS, security, compression, favicon and body parsing
app.use(cors());
app.use(helmet());
app.use(compress());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', feathers.static(app.get('public')));

/**
 * GET CONTROLLER: /api/get/file/:checksum/:filename
 *                 feathers express middleware controller to handle get requests
 *                 to the get file api
 */
app.get('/api/get/file/:checksum/:filename', (req, res) => {
  let filePath = path.join(__dirname, SERVE_DIRECTORY, req.params.filename);
  console.log('==== SERVING REQUEST FOR FILE ====\n', filePath);
  /**
   * checksum: checksum of the file for re-validation on server side
   *           - since the service calls the filePath again to get the requested resource
   *             it is important to check the checksum again to make sure that the data
   *             requested has the correct integrity
   *
   */

  fileDetails.checksum(filePath).then((checksum) => {
    if(checksum === req.params.checksum) {
      sendFile(req, res, filePath);
    } else {
      res.sendStatus(404);
    }
  });
});

// Set up Plugins and providers
app.configure(hooks());
app.configure(rest());
app.configure(socketio());

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
// Set up our services (see `services/index.js`)
app.configure(services);
// Configure a middleware for 404s and the error handler
app.use(notFound());
app.use(handler());

app.hooks(appHooks);

module.exports = app;
