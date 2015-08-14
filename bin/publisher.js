// publisher.js

var config = require('./config');
var OAuth = require('adal-node');
var request = require('request');
var util = require('util');
var fs = require('fs');
var _ = require('lomath');

// define the api endpoints
const API_NEW_FILE_ENDPOINT = "https://api.open.glasgow.gov.uk/Files/Organisation/%s/Dataset/%s";
const API_NEW_FILE_VERSION_ENDPOINT = "https://api.open.glasgow.gov.uk/Files/Organisation/%s/Dataset/%s/File/%s";

// public access to set properties and create the resources
module.exports = {

  // methods
  addExternalFile: function(json, requestComplete) {

    getToken(null, json, null, requestComplete);
  },
  addExternalFileVersion: function(fileId, json, requestComplete) {

    getToken(fileId, json, null, requestComplete);
  },
  addFile: function(json, file, requestComplete) {

    getToken(null, json, file, requestComplete);
  },
  addFileVersion: function(fileId, json, file, requestComplete) {

    getToken(fileId, json, file, requestComplete);
  }
};

/**
 * Gets an oauth token for this client.
 * @param fileId - Optional file to update.
 * @param json - the json metadata to send.
 * @param file - the optional file stream to post.
 * @param requestComplete - callback when the token has been retrieved.
 */
var getToken = function(fileId, json, file, requestComplete) {

    // get an auth context for the specified tenant
    var oauth = new OAuth.AuthenticationContext(config.Authbase + config.TenantId);

    // now get an access token
    oauth.acquireTokenWithClientCredentials(config.ResourceId,
        config.ClientId,
        config.ClientKey,
        function (err, response) {
            if (err) {
                console.log('Error: ' + err.stack);
                throw err;
            } else {
                console.log('bearer:', response);

              if (file != null) {

                console.log('Making a request with a file resource.');

                // call back with the token
                makeRequestWithFile(response.accessToken, fileId, json, file, requestComplete);

              } else {

                console.log('Making a request to an external file.');

                // call back with the token
                makeRequest(response.accessToken, fileId, json, requestComplete);

              }
            }
        });
};

/**
 * Creates the new resource on the platform.
 * @param {string} token - The oauth token
 * @param {int} fileId - optional id of an existing file to update
 * @param {string} json - the metadata as a json string
 * @param {object} requestComplete - the callback when the request is done
 */
var makeRequest = function (token, fileId, json, requestComplete) {
    // create http request
    // attach bearer token
    // build endpoint
    // attach metadata
    // do request
    // get response

    var uri;

    // is this a create or an update of an existing file
    if (fileId == null) {

      uri = util.format(API_NEW_FILE_ENDPOINT, config.OrgId, config.DatasetId);
      console.log('Creating a new external file : ' + uri);

    } else {

      uri = util.format(API_NEW_FILE_VERSION_ENDPOINT, config.OrgId, config.DatasetId, fileId);
      console.log('Creating a new external file version : ' + uri);
    }

    request.post(uri, {
        auth: {
            bearer: token
        },
        qs: {
          'subscription-key':config.SubscriptionKey
        },
        json: true,
        body: JSON.parse(json)
    }, function(err, res, body) {
        if (res.statusCode != 200) {
            err = res;
        }
            requestComplete(err, JSON.stringify(body));
        }
    );
};

/**
 * Creates the new resource on the platform with the specified file resource.
 * @param {string} token - The oauth token
 * @param {int} fileId - optional id of an existing file to update
 * @param {string} json - the metadata as a json string
 * @param {string} file - the local path to the file to push
 * @param {object} requestComplete - the callback when the request is done
 */
var makeRequestWithFile = function (token, fileId, json, file, requestComplete) {
  // create http request
  // attach bearer token
  // build endpoint
  // attach metadata
  // do request
  // get response

  var uri;

  // is this a create or an update of an existing file
  if (fileId == null) {

    uri = util.format(API_NEW_FILE_ENDPOINT, config.OrgId, config.DatasetId);
    console.log('Creating a new external file with resource : ' + uri);

  } else {

    uri = util.format(API_NEW_FILE_VERSION_ENDPOINT, config.OrgId, config.DatasetId, fileId);
    console.log('Creating a new external file version with resource : ' + uri);
  }

  // a bug in form-data means it doesn't support nested json, so we need to flatten it
  var f = _.flattenJSON(JSON.parse(json));
  console.log('Flattened: ' + JSON.stringify(f));

  var data = {
    body: JSON.stringify(f),
    content: {
      value: fs.createReadStream(file),
      options: {
        filename: config.UploadedFileName
      }
    }
  };

  request.post({
    uri: uri,
    auth: {
      bearer: token
    },
    qs: {
      'subscription-key':config.SubscriptionKey
    },
    formData: data
  }, function(err, res, body) {
    if (res.statusCode != 200) {
      err = res;
    }
    requestComplete(err, JSON.stringify(body));
  });
};