/**
 * FileName: file-details.class.js
 *           constructs for verbs for file-details service. Corresponds to the 
 *           /api/stats/files/:fileName (api). 
 * version [major.minor.patch]: 0.1.0
 *
 * Dependencies:
 *      - file-details.service [shared-services/file-details.service]
 *      - path : nodejs path api [>6.9.5]
 *      - fs : nodejs path api [>6.9.5]
 *
 * Exports: 
 *      - Service : class Service
 *
 * Example:
 *      const fileDetailsService = require('<path to file-details.class>');
 *
 *      let options = {};       // options object for the class
 *      fileDetailsService(options);
 *
 **/
/*
 * TODO:
 * version 0.1.0:
 *      - the class allows all the http actions to work with respect to the 
 *        corresponding api calls. remove the calls to the api's that are not
 *        needed or return status 500 in the promise so that the calls are 
 *        in-accessible
 *
 *      - flatten the promise in get(id, params) for file.stats and file.checksum
 *
 * FIXME:
 */

const fileDetails = require('../../../shared-services/file-details.service');
const path = require('path');
const fs = require('fs');

/* eslint-disable no-unused-vars */
class Service {
  
  constructor (options) {
    this.options = options || {};
    this.SERVE_DIRECTORY_PATH = '../../../SERVE_FILES/';
  }

  find (params) {
    return Promise.resolve([]);
  }

  /**
   * get(id, params):
   *    api [GET]: /api/stats/files/:{id}
   *            - corresponds to the api to get the file stats and md5 back to the end user
   *              as a JSON Object, [GET] also returns the api call to the resource 
   *              itself that is retrieved through the route 
   *              /api/getfiles/:{fileName}
   *
   * @param {String} id: id at the end of the requested uri /api/stats/files/:{id}
   * @param {String} param: query parameters supplemented with the id in the uri
   * 
   * @returns {Promise} promise: returns the server response over JSON object as a promise
   *                             - RESPONSE:
   *                                    {
   *                                     file: {
   *                                      name: <file-name>,
   *                                      size: <file-size>,
   *                                      last_modified: <file-mtim>,
   *                                      md5_checksum: <file-md5-checksum>
   *                                     },
   *                                     get_file_api:<api to get the file resource>
   *                                    }
   */ 
  get (id, params) {
    let directoryPath = path.join(__dirname, this.SERVE_DIRECTORY_PATH);
    return new Promise((resolve, reject) => {
      
      // get files from the serving directory
      fileDetails.getFiles(directoryPath).then((files) => {
        let isFilePresent = false;
        for(let file of files) {
          let fileName = file.substr(0, file.lastIndexOf('.'));
          if (fileName === id) {
            isFilePresent = true;
            let filePath = path.join(directoryPath, file);

            // get the file stats for the response
            fileDetails.stats(filePath).then((fileStats) => {

              // get the file checksum for the response
              fileDetails.checksum(filePath).then((checksum) => {
                if(checksum !== undefined) {
                  resolve({
                    file: {
                      name: `${id}`,
                      size: fileStats.size,
                      last_modified: fileStats.mtime,
                      md5_checksum: checksum
                    },
                    get_file_api: `/api/get/file/${checksum}/${file}`
                  });
                } else {
                  resolve({
                    error: 'file not found',
                    message: 'The name of the file that you requested is either incorrect or the file is missing'
                  });
                }
              });
            });
          } 
        }

        // if the file identifier is not present send a not found response
        if (!isFilePresent) {
          resolve({
            error: 'file not found',
            message: 'The name of the file that you requested is either incorrect or the file is missing'
          });
        }
      });
    });
  }

  create (data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current)));
    }

    return Promise.resolve(data);
  }

  update (id, data, params) {
    return Promise.resolve(data);
  }

  patch (id, data, params) {
    return Promise.resolve(data);
  }

  remove (id, params) {
    return Promise.resolve({ id });
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
