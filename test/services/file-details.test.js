const assert = require('assert');
const app = require('../../src/app');

describe('\'file-details\' service', () => {
  it('registered the service', () => {
    const service = app.service('api/stats/files');

    assert.ok(service, 'Registered the service');
  });
});
