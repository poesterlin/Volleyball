// @ts-check
'use strict';
const jwt = require('jsonwebtoken');
const { respond } = require('./helpers');

// Set in `environment` of serverless.yml
const AUTH0_CLIENT_ID = process.env.auth_client;
const AUTH0_CLIENT_PUBLIC_KEY = process.env.AUTH0_CLIENT_PUBLIC_KEY;

const generatePolicy = (principalId, effect, resource) => {
  const authResponse = { principalId };
  if (effect && resource) {
    authResponse.policyDocument = {
      Version: '2012-10-17',
      Statement: [{
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource
      }]
    };
  }
  return authResponse;
};

// Reusable Authorizer function, set on `authorizer` field in serverless.yml
module.exports.auth = (event, _context, callback) => {
  if (!event.authorizationToken) {
    return callback('Unauthorized');
  }

  console.log('method', event.methodArn);

  const tokenParts = event.authorizationToken.split(' ');
  const tokenValue = tokenParts[1];

  // no auth token!
  if (!(tokenParts[0].toLowerCase() === 'bearer' && tokenValue)) {
    return callback('Unauthorized');
  }

  const options = { audience: AUTH0_CLIENT_ID };

  try {
    jwt.verify(tokenValue, AUTH0_CLIENT_PUBLIC_KEY, options, (verifyError, decoded) => {
      if (verifyError) {
        console.log('verifyError', verifyError);
        // 401 Unauthorized
        console.log(`Token invalid. ${verifyError}`);
        return callback('Unauthorized');
      }

      console.log(decoded);
      const roles = decoded['https://ausowa.netlify.app/role'];

      if (roles && roles.length === 1 && roles[0] === 'Admin') {
        console.log('valid from customAuthorizer', decoded.email);
        return callback(null, generatePolicy(decoded.sub, 'Allow', event.methodArn));
      }

      return callback('Unauthorized');
    });
  } catch (err) {
    console.log('catch error. Invalid token', err);
    return callback('Unauthorized');
  }
};

module.exports.authCheck = async function (event, _context, callback) {
  return respond({ authorized: true });
}
