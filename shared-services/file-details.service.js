/**
 * FileName: file-details.service.js
 *           gets the details of the file and the md5 checksum of the file
 *           that was requested
 * version [major.minor.patch]: 0.1.0
 *
 * Dependencies:
 *      - fs : nodejs fs api [>=6.9.5]
 *      - path : nodejs path api [>=6.9.5]
 *      - md5 : npm i --save md5 [>=2.2.1]
 *
 * Exports:
 *      - fileChecksum : returns the file md5 checksum
 *      - fileStats : returns the file stats
 *
 * Example:
 *      cosnt fileDetails = require('file-details.service'); // if isntalled as node module
 *                                                           // if not then require('<path to file-details.service>')
 *      let filePath = getFilePathSomehow();
 *      
 *      fileDetails.stats(filePath).then((stats) => {
 *              ...fileStats available here;
 *      });
 *
 *      fileDetails.checksum(fielPath).then((checksum) => {
 *              ...file checksum availble here;
 *      });
 *
 *
 **/
/**
 * TODO:
 * version 0.1.0:
 *      - create a logger service that can handle console.logs
 *      - createa a error logger service for better error logging
 *      
 * FIXME:
 **/

const fs = require('fs');
const path = require('path');
const md5 = require('md5');

/**
 * filesInDirectory(...):
 *      gets all the files in the directory using the fs.readDir api nodejs
 *      [https://nodejs.org/dist/latest-v6.x/docs/api/fs.html#fs_fs_readdir_path_options_callback]
 *
 * @param {String} filePath: full path of the file for which the stats
 *                           are requested
 * @returns {Promise} promise: wraps the file stats as a promise
 *                             [fs.stats -> async api]
 */
let filesInDirectory = function(filePath) {
  return new Promise((resolve, reject) => {
    fs.readdir(filePath, 'utf8', (err, files) => {
      if(err) {
        console.info('------- Error fetching the file from the path: ', filePath);
        console.error({
          ERROR: {
            code_path: 'ERROR: error from file-details.serivce.js',
            code_function: 'function: filesInDirectory',
            try_block: 'fs.readDir',
            error_value: err
          }
        });
      }
      resolve(files);
    }); 
  });
};

/**
 * fileStats(...):
 *      gets the stats of the files useing the nodejs api
 *      fs.stats [https://nodejs.org/dist/latest-v6.x/docs/api/fs.html#fs_class_fs_stats]
 *
 * @param {String} filePath: full path of the file for which the stats
 *                           are requested
 * @returns {Promise} promise: wraps the file stats as a promise
 *                             [fs.stats -> async api]
 */
let fileStats = function(filePath){

  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      resolve(stats);
      if(err) {
        console.info('------- Error fetching the file from the path: ', filePath);
        console.error({
          ERROR: {
            code_path: 'ERROR: error from file-details.serivce.js',
            code_function: 'function: fileStats',
            try_block: 'fs.stat',
            error_value: err
          }
        });
      }
    });
  });
};

/**
 * fileChecksum(...):
 *      gets the md5 checksum of the file contents using md5 module
 *      [npm i --save md5 (>=2.2.1)]
 *
 * @param {String} filePath: full path of the file for which the checksum is
 *                           requested
 * @returns {Promise} promise: wraps the checksum value as a promise                           
 *                             [fs.readFile -> async api]
 */     
let fileChecksum = function(filePath) {

  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.info('------- Error fetching the file from the path: ', filePath);
        console.error({
          ERROR: {
            code_path: 'ERROR: error from file-details.serivce.js',
            code_function: 'function: fileChecksum',
            try_block: 'fs.readFile',
            error_value: err
          }
        });
        resolve(undefined);
      } else {
        resolve(md5(data));
      }
    });
  });
};

let fileDetails = {
  stats: fileStats,
  checksum: fileChecksum,
  getFiles: filesInDirectory
};

module.exports = fileDetails; 
