// Initializes the `file-details` service on path `/api/stats/files`
const createService = require('./file-details.class.js');
const hooks = require('./file-details.hooks');
const filters = require('./file-details.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');

  const options = {
    name: 'file-details',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/api/stats/files', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('api/stats/files');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
