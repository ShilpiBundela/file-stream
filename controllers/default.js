/**
 * FileName: default.js
 *           controller for api's:
 *           /                                     --> default api
 *           /api/stats/files/{fileidentifier}     --> api to get the file stats and checksum
 *           /api/get/file/{checksum}/{filename}/  --> api to get the requested resource
 * version [major.minor.patch]: 0.1.0
 *
 * Dependencies
 *      - file-details.service [shared-services/file-details.service]
 *      - file-stream.service [shared-service/file-stream.service]
 *      - path
 *      - fs
 *
 * Exports:
 *      - api controller with api routes
 *        ['/', '/api/get/file/{checksum}/{filename}/', '/api/stats/files/{fileidentifier}']
 *
 */
/**
 * FIXME:
 *
 * TODO:
 * Version 0.1.0:
 *      - update the default api '/' to be used as a healthcheck monitor
 *      - divide the functions into individual services
 */

const sendFile = require('../shared-services/file-stream.service');
const fileDetails = require('../shared-services/file-details.service');
const path = require('path');
const fs = require('fs');
const SERVE_DIRECTORY = '../SERVE_FILES'

/**
 * Controller export:
 *      EXPORTED API's:
 *      -- '/'                                          [default]
 *      -- '/api/get/file/{checksum}/{filename}/'       [get requested resource]
 *      -- '/api/stats/files/{fileidentifier}'          [get file stats and checksum]
 */
exports.install = function() {
  F.route('/', plain_version);
  F.route('/api/get/file/{checksum}/{filename}/', getFile);
  F.route('/api/stats/files/{fileidentifier}', getFileStats);
};

/**
 * plain_version:
 *      service corresponding to default api call '/'
 *
 * @returns {http_response} : REST name, REST version as set in config
 */
function plain_version() {
  var self = this;
  self.plain('REST Service {0}\nVersion: {1}'.format(F.config.name, F.config.version));
}

/**
 * getFile(...):
 *      - Service corresponding to the api call
 *              [GET] '/api/get/file/{filename}/'
 *              returns the requested resource as a stream
 *
 * @param {String} filename: full name of the requested resource
 * @param {String} checksum: checksum of the file that is requested
 *
 * @returns {http_response} : returns the requested resource if the file hash is equal to the
 *                            checksum
 */
function getFile(checksum, filename) {
  let self = this;
  let filePath = path.join(__dirname, SERVE_DIRECTORY, filename);
  console.log('===== SERVING REQUEST FOR FILE =====\n', filePath);

  /**
   * checksum: checksum of the file for re-validation on the server side
   *           - since the service calls the filePath again to get the requested resource
   *             it is important to check the checksum agian to make sure the data requested
   *             has the correct integrity
   *
   */

  fileDetails.checksum(filePath).then((file_checksum) => {

    if ( file_checksum === checksum) {
      sendFile(self.req, self.res, filePath);
      self.res.status(200);
    } else {
      self.res.status(401).json({
        error: 'incorrect checksum',
        message: 'the resource you request is not available or you are not authorized to view it'
      });
    }
  });
}

/**
 * getFileStats(filidentifier):
 *      api [GET]: /api/stats/files/{fileidentifier}
 *              - corresponds to the api to get the file stats and md5 back to the end user
 *                as a JSON Object. [GET] also returns the api call to the resource itself
 *                that is retrieved through the route
 *                /api/get/files/{checksum}/{filename}/
 *
 * @param {String} fileidentifier: id at the end of the reuested uri /api/stats/files/{fileidentifier}
 *
 * @returns {http_response} : returns the server response over JOSN
 *                            - [200] RESPONSE:
 *                            {
 *                              file: {
 *                                name: <file-name>,
 *                                size: <file-size>
 *                                last_modified: <file-mtime>
 *                                md5_checksum: <file-md5-checksum>
 *                              },
 *                              get_file_api: <api to get the file resource>
 *                            }
 */
function getFileStats(fileidentifier) {
  let self = this;
  let directoryPath = path.resolve(__dirname, SERVE_DIRECTORY);

  //get the files from the serving directory
  fileDetails.getFiles(directoryPath).then((files) => {
    let isFilePresent = false;

    for (let file of files) {
      let fileName = file.substr(0, file.lastIndexOf('.'));

      if (fileName === fileidentifier) {
        isFilePresent = true;
        let filePath = path.join(directoryPath, file);

        //get the file stats for the response
        fileDetails.stats(filePath).then((fileStats) => {

          // get the file checksum for the response
          fileDetails.checksum(filePath).then((checksum) => {
            if (checksum !== undefined) {
              self.res.status(200).json({
                file:{
                  name: fileidentifier,
                  size: fileStats.size,
                  last_modified: fileStats.mtime,
                  md5_checksum: checksum
                },
                get_file_api: '/api/get/file/' + checksum + '/' + file + '/'
              });
            } else {
              self.res.status(404).json({
                error: 'file not found',
                message: 'The name of the file that you requested is either incorrect or the file is missing',
                error_info: 'checksum incorrect / mismatch'
              });
            }
          });
        });
      }
    }

    if(!isFilePresent) {
      self.res.status(404).json({
        message: 'could not find file'
      });
    }
  });
}
