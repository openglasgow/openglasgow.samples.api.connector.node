#! /usr/bin/env node

// initialise module dependencies
var config = require('./config');
var fs = require('fs');
var publisher = require('./publisher.js');

// get the json file dependencies
var pathToJsonNewFileRequestBodyExternal = '../public/testexternal.json';
var pathToJsonNewFileRequestBody = '../public/test.json';
var pathToFile = '../public/test.csv';

init('addExternalFile');
//init('addExternalFileVersion');
//init('addFile');
//init('addFileVersion');

function init(runwith) {

    if (runwith == 'addExternalFile') {

        // read the json file and start the publishing
        fs.readFile(pathToJsonNewFileRequestBodyExternal, 'utf8', bootstrap_addExternalFile);

    } else if (runwith == 'addExternalFileVersion') {

        // read the json file and start the publishing
        fs.readFile(pathToJsonNewFileRequestBodyExternal, 'utf8', bootstrap_addExternalFileVersion);

    } else if (runwith == 'addFile') {

        // read the json file and start the publishing
        fs.readFile(pathToJsonNewFileRequestBody, 'utf8', bootstrap_addFile);

    } else if (runwith == 'addFileVersion') {

        // read the json file and start the publishing
        fs.readFile(pathToJsonNewFileRequestBody, 'utf8', bootstrap_addFileVersion);

    }
}



/**
 * Kicks off reading the json config file and the publishing of that data as an external file.
 * @param {string} err - The error reading the file.
 * @param {string} data - The data from the json file.
 */
function bootstrap_addExternalFile(err, data) {
    if (err) throw err;

    publisher.addExternalFile(data, requestComplete);
}

/**
 * Kicks off reading the json config file and the publishing of that data as an external file version.
 * @param {string} err - The error reading the file.
 * @param {string} data - The data from the json file.
 */
function bootstrap_addExternalFileVersion(err, data) {
    if (err) throw err;

    publisher.addExternalFileVersion(config.FileId, data, requestComplete);
}

/**
 * Kicks off reading the json config file and the publishing of that data as an external file version.
 * @param {string} err - The error reading the file.
 * @param {string} data - The data from the json file.
 */
function bootstrap_addFile(err, data) {
  if (err) throw err;

  publisher.addFile(data, pathToFile, requestComplete);
}

/**
 * Kicks off reading the json config file and the publishing of that data as an external file version.
 * @param {string} err - The error reading the file.
 * @param {string} data - The data from the json file.
 */
function bootstrap_addFileVersion(err, data) {
  if (err) throw err;

  publisher.addFileVersion(config.FileId, data, pathToFile, requestComplete);
}

/**
 * @param {string} err - The error associated with the request.
 * @param {string} id - The Unique guid for this request
 */
function requestComplete(err, id) {
    if (err == null) {
        console.log("Request Identifier is " + id);
    } else {
        console.log('There was an error making the request :' + JSON.stringify(err))
    }

}