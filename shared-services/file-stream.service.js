/**
 * FileName: file-stream.service.js
 *           service to manage streaming of file to the end user
 *           accepts the {Range: bytes=...} request header to send the file
 *           in chunks in case if the file size is too big
 *           if not the file can be sent as a express read stream
 * version [major.minor.patch]: 0.1.0
 *
 * Dependencies: 
 *      - fs : FileSystem api nodejs [>6.9.5]
 *      - path : path api nodejs [>6.9.5]
 *      - file-details.service : ./file-details.service
 *
 * Exports:
 *      - sendFile
 *              function accepts filePath as the path to the requested resource
 *              and sends the file to the end user
 *
 * Example:
 *      cosnt sendFile = require('file-stream.service.js') // if installed as a node module
 *                                                         // else replace with <path to file-stream.service>
 *      app.route('/')
 *         .get((request, resposne) => {
 *              let fileName = getTheFileNameSomehow();
 *              sendFile(request, response, fileName)
 *         })
 */
/**
 * FIXME/TODO:
 * version 0.1.0:
 *      - make two versions of the streaming service:
 *              |- one that supports chunked streaming, with range headers 
 *                 [accepts-range, Range: bytes=0-]
 *              |- one that supports full content transfer
 *
 *      - make a logger service and replace console.info and console.error
 *        to reduce the function size
 */

const fs = require('fs');
const path = require('path');
const fileDetails = require('./file-details.service');

/**
 * sendFile(...)
 *      - sends the file to the end user as a chunked response if the Range
 *        header is present and as a full stream if not
 *
 * @param {http_request} req: http request as a dependency injection
 * @param {http_response} res: http response as a dependency injection
 * @param {String} filePath: path of the file that is to be sent to the end user
 *
 */
let sendFile = function(req, res, filePath) {

  fileDetails.stats(filePath).then((fileStats) => {
    if (req.headers['range']) {
      _chunkedStream(req, res, fileStats, filePath);
    } else {
      _fullStream(req, res, fileStats, filePath);
    }
  });
};

/**
 * _chunkedStream(...)
 *      - chunked streaming for the resource when the range header is present in the request
 *        i.e. Range: bytes=<byte>-..
 *        if present response will be a partial content header and status
 *        this is used for large file transfer over the wire in chunks.
 *        uses the nodejs createReadStream api 
 *        [https://nodejs.org/dist/latest-v6.x/docs/api/fs.html#fs_fs_createreadstream_path_options]
 *
 * @param {http_request} req: http request as a dependency injection
 * @param {http_response} res: http response as a dependency injection
 * @param {Object} stat: file stats as returned by the fs.stats nodejs api
 *                       [https://nodejs.org/dist/latest-v6.x/docs/api/fs.html#fs_fs_stat_path_callback]
 * @param {String} filePath: full path of the file resource as requested
 *
 * @returns {stream} returns the resource as a stream
 *                   [https://nodejs.org/dist/latest-v6.x/docs/api/stream.html#stream_readable_streams]
 *
 */
let _chunkedStream = function(req, res, stat, filePath) {
  let range = req.headers.range;
  let parts = range.replace(/bytes=/, '').split('-');
  let partialstart = parts[0];
  let partialend = parts[1];

  let start = parseInt(partialstart, 10);
  let end = partialend ? parseInt(partialend, 10) : stat.size-1;
  let chunksize = (end-start)+1;
    
  res.writeHead(206, { 
    'Content-Range': 'bytes ' + start + '-' + end + '/' + stat.size,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunksize,
    'Content-Type': 'text/octet-stream'
  });
    
  let fileStream = fs.createReadStream(filePath, {start: start, end: end});
  fileStream.on('error', (err) => {
    console.info('-------- ERROR Streaming file from filePath: ', filePath);
    console.error({
      ERROR: {
        code_path: 'ERRPR: error from file-stream.service.js',
        code_function: 'function: sendFile',
        try_block: 'fs.createReadStream [chunked]',
        error_value: err
      }
    });
  });  
  fileStream.pipe(res);
};

/**
 * _fullStream(...)
 *      - this function is used to send smaller files over the wire as a read stream 
 *        using the nodejs createReadStream api
 *        [https://nodejs.org/dist/latest-v6.x/docs/api/fs.html#fs_fs_createreadstream_path_options]
 *
 * @param {http_request} req: http request as a dependency injection
 * @param {http_response} res: http response as a dependency injection
 * @param {Object} stat: file stats as returned by the fs.stats nodejs api
 *                       [https://nodejs.org/dist/latest-v6.x/docs/api/fs.html#fs_fs_stat_path_callback]
 * @param {String} filePath: full path of the file resource as requested
 *
 * @returns {stream} returns the resource as a stream
 *                   [https://nodejs.org/dist/latest-v6.x/docs/api/stream.html#stream_readable_streams]
 *
 */
let _fullStream = function(req, res, stat, filePath) {
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Type', 'text/octet-stream');
  fileStream = fs.createReadStream(filePath);
  fileStream.on('error', (err) => {
    console.info('------- ERROR Streaming file from filePath: ', filePath);
    console.error({
      ERROR: {
        code_path: 'ERRPR: error from file-stream.service.js',
        code_function: 'function: sendFile',
        try_block: 'fs.createReadStream [not-chunked]',
        error_value: err
      }
    });

  });
  fileStream.pipe(res);
};
module.exports = sendFile;
