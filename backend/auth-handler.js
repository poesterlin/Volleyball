// @ts-check
'use strict';
const jwt = require('jsonwebtoken');

const AUTH0_CLIENT_ID = process.env.auth_client;

exports.auth = function (event, context, callback) {
  // Do not print the auth token unless absolutely necessary
  // console.log('Client token: ' + event.authorizationToken);
  console.log('Method ARN: ' + event.methodArn);

  if (!event.authorizationToken) {
    return callback('Unauthorized');
  }

  const tokenParts = event.authorizationToken.split(' ');
  const tokenValue = tokenParts[1];

  if (!(tokenParts[0].toLowerCase() === 'bearer' && tokenValue)) {
    return callback('Unauthorized');
  }

  const options = {
    audience: AUTH0_CLIENT_ID,
  };

  let decoded;
  try {
    decoded = jwt.verify(tokenValue, process.env.AUTH0_CLIENT_PUBLIC_KEY, options)
  } catch (error) {
    console.log(`Token invalid.`);
    return callback('Unauthorized');
  }

  console.log(decoded);
  const roles = decoded['https://ausowa.netlify.app/role'];

  if (!roles || roles.length !== 1 || roles[0] !== 'Admin') {
    return callback('Unauthorized');
  }

  // build apiOptions for the AuthPolicy
  let apiOptions = {};
  let tmp = event.methodArn.split(':');
  let apiGatewayArnTmp = tmp[5].split('/');
  let awsAccountId = tmp[4];
  apiOptions.region = tmp[3];
  apiOptions.restApiId = apiGatewayArnTmp[0];
  apiOptions.stage = apiGatewayArnTmp[1];

  let policy = new AuthPolicy(decoded.sub, awsAccountId, apiOptions);
  policy.allowMethod(AuthPolicy.HttpVerb.POST, "courses");
  policy.allowMethod(AuthPolicy.HttpVerb.DELETE, "courses");
  policy.allowMethod(AuthPolicy.HttpVerb.GET, "courses/details");

  callback(null, policy.build());
};

/**
 * AuthPolicy receives a set of allowed and denied methods and generates a valid
 * AWS policy for the API Gateway authorizer. The constructor receives the calling
 * user principal, the AWS account ID of the API owner, and an apiOptions object.
 * The apiOptions can contain an API Gateway RestApi Id, a region for the RestApi, and a
 * stage that calls should be allowed/denied for. For example
 * {
 *   restApiId: "xxxxxxxxxx",
 *   region: "us-east-1",
 *   stage: "dev"
 * }
 *
 * let testPolicy = new AuthPolicy("[principal user identifier]", "[AWS account id]", apiOptions);
 * testPolicy.allowMethod(AuthPolicy.HttpVerb.GET, "/users/username");
 * testPolicy.denyMethod(AuthPolicy.HttpVerb.POST, "/pets");
 * context.succeed(testPolicy.build());
 *
 * @class AuthPolicy
 * @constructor
 */
class AuthPolicy {

  static HttpVerb = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    PATCH: "PATCH",
    HEAD: "HEAD",
    DELETE: "DELETE",
    OPTIONS: "OPTIONS",
    ALL: "*"
  };

  constructor(principal, awsAccountId, apiOptions) {
    /**
     * The AWS account id the policy will be generated for. This is used to create
     * the method ARNs.
     *
     * @property awsAccountId
     * @type {String}
     */
    this.awsAccountId = awsAccountId;

    /**
     * The principal used for the policy, this should be a unique identifier for
     * the end user.
     *
     * @property principalId
     * @type {String}
     */
    this.principalId = principal;

    /**
     * The policy version used for the evaluation. This should always be "2012-10-17"
     *
     * @property version
     * @type {String}
     * @default "2012-10-17"
     */
    this.version = "2012-10-17";

    /**
     * The regular expression used to validate resource paths for the policy
     *
     * @property pathRegex
     * @type {RegExp}
     * @default '^\/[/.a-zA-Z0-9-\*]+$'
     */
    this.pathRegex = new RegExp('^[/.a-zA-Z0-9-\*]+$');

    // these are the internal lists of allowed and denied methods. These are lists
    // of objects and each object has 2 properties: A resource ARN and a nullable
    // conditions statement.
    // the build method processes these lists and generates the approriate
    // statements for the final policy
    this.allowMethods = [];
    this.denyMethods = [];
    this.restApiId = apiOptions.restApiId;
    this.region = apiOptions.region;
    this.stage = apiOptions.stage;
  }

  /**
   * Adds a method to the internal lists of allowed or denied methods. Each object in
   * the internal list contains a resource ARN and a condition statement. The condition
   * statement can be null.
   *
   * @method addMethod
   * @param {String} effect The effect for the policy. This can only be "Allow" or "Deny".
   * @param {String} verb The HTTP verb for the method, this should ideally come from the
   *                      AuthPolicy.HttpVerb object to avoid spelling mistakes
   * @param {String} resource The resource path. For example "/pets"
   * @param {Object} conditions The conditions object in the format specified by the AWS docs.
   * @return {void}
   */
  addMethod(effect, verb, resource, conditions) {
    if (verb != "*" && !AuthPolicy.HttpVerb.hasOwnProperty(verb)) {
      throw new Error("Invalid HTTP verb " + verb + ". Allowed verbs in AuthPolicy.HttpVerb");
    }

    if (!this.pathRegex.test(resource)) {
      throw new Error("Invalid resource path: " + resource + ". Path should match " + this.pathRegex);
    }

    let cleanedResource = resource;
    if (resource.substring(0, 1) == "/") {
      cleanedResource = resource.substring(1, resource.length);
    }
    let resourceArn = "arn:aws:execute-api:" +
      this.region + ":" +
      this.awsAccountId + ":" +
      this.restApiId + "/" +
      this.stage + "/" +
      verb + "/" +
      cleanedResource;

    if (effect.toLowerCase() == "allow") {
      this.allowMethods.push({
        resourceArn: resourceArn,
        conditions: conditions
      });
    } else if (effect.toLowerCase() == "deny") {
      this.denyMethods.push({
        resourceArn: resourceArn,
        conditions: conditions
      })
    }
  }

  /**
   * Returns an empty statement object prepopulated with the correct action and the
   * desired effect.
   *
   * @method getEmptyStatement
   * @param {String} effect The effect of the statement, this can be "Allow" or "Deny"
   * @return {Object} An empty statement object with the Action, Effect, and Resource
   *                  properties prepopulated.
   */
  getEmptyStatement(effect) {
    effect = effect.substring(0, 1).toUpperCase() + effect.substring(1, effect.length).toLowerCase();
    let statement = {};
    statement.Action = "execute-api:Invoke";
    statement.Effect = effect;
    statement.Resource = [];

    return statement;
  }

  /**
   * This function loops over an array of objects containing a resourceArn and
   * conditions statement and generates the array of statements for the policy.
   *
   * @method getStatementsForEffect
   * @param {String} effect The desired effect. This can be "Allow" or "Deny"
   * @param {Array} methods An array of method objects containing the ARN of the resource
   *                and the conditions for the policy
   * @return {Array} an array of formatted statements for the policy.
   */
  getStatementsForEffect(effect, methods) {
    let statements = [];

    if (methods.length > 0) {
      let statement = this.getEmptyStatement(effect);

      for (let i = 0; i < methods.length; i++) {
        let curMethod = methods[i];
        if (curMethod.conditions === null || curMethod.conditions.length === 0) {
          statement.Resource.push(curMethod.resourceArn);
        } else {
          let conditionalStatement = this.getEmptyStatement(effect);
          conditionalStatement.Resource.push(curMethod.resourceArn);
          conditionalStatement.Condition = curMethod.conditions;
          statements.push(conditionalStatement);
        }
      }

      if (statement.Resource !== null && statement.Resource.length > 0) {
        statements.push(statement);
      }
    }

    return statements;
  }

  /**
   * Adds an allow "*" statement to the policy.
   *
   * @method allowAllMethods
   */
  allowAllMethods() {
    this.addMethod("allow", "*", "*", null);
  }

  /**
   * Adds a deny "*" statement to the policy.
   *
   * @method denyAllMethods
   */
  denyAllMethods() {
    this.addMethod("deny", "*", "*", null);
  }

  /**
   * Adds an API Gateway method (Http verb + Resource path) to the list of allowed
   * methods for the policy
   *
   * @method allowMethod
   * @param {String} verb The HTTP verb for the method, this should ideally come from the
   *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
   * @param {string} resource The resource path. For example "/pets"
   * @return {void}
   */
  allowMethod(verb, resource) {
    this.addMethod("allow", verb, resource, null);
  }

  /**
   * Adds an API Gateway method (Http verb + Resource path) to the list of denied
   * methods for the policy
   *
   * @method denyMethod
   * @param {String} verb The HTTP verb for the method, this should ideally come from the
   *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
   * @param {string} resource The resource path. For example "/pets"
   * @return {void}
   */
  denyMethod(verb, resource) {
    this.addMethod("deny", verb, resource, null);
  }

  /**
   * Adds an API Gateway method (Http verb + Resource path) to the list of allowed
   * methods and includes a condition for the policy statement. More on AWS policy
   * conditions here: http://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html#Condition
   *
   * @method allowMethodWithConditions
   * @param {String} verb The HTTP verb for the method, this should ideally come from the
   *                  AuthPolicy.HttpVerb object to avoid spelling mistakes
   * @param {string} resource The resource path. For example "/pets"
   * @param {Object} conditions The conditions object in the format specified by the AWS docs
   * @return {void}
   */
  allowMethodWithConditions(verb, resource, conditions) {
    this.addMethod("allow", verb, resource, conditions);
  }

  /**
   * Adds an API Gateway method (Http verb + Resource path) to the list of denied
   * methods and includes a condition for the policy statement. More on AWS policy
   * conditions here: http://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html#Condition
   *
   * @method denyMethodWithConditions
   * @param {String}verb The HTTP verb for the method, this should ideally come from the
   *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
   * @param {string}resource The resource path. For example "/pets"
   * @param {Object}conditions The conditions object in the format specified by the AWS docs
   * @return {void}
   */
  denyMethodWithConditions(verb, resource, conditions) {
    this.addMethod("deny", verb, resource, conditions);
  }

  /**
   * Generates the policy document based on the internal lists of allowed and denied
   * conditions. This will generate a policy with two main statements for the effect:
   * one statement for Allow and one statement for Deny.
   * Methods that includes conditions will have their own statement in the policy.
   *
   * @method build
   * @return {Object} The policy object that can be serialized to JSON.
   */
  build() {
    if ((!this.allowMethods || this.allowMethods.length === 0) &&
      (!this.denyMethods || this.denyMethods.length === 0)) {
      throw new Error("No statements defined for the policy");
    }

    let policy = {};
    policy.principalId = this.principalId;
    let doc = {};
    doc.Version = this.version;
    doc.Statement = [];

    doc.Statement = doc.Statement.concat(this.getStatementsForEffect.call(this, "Allow", this.allowMethods));
    doc.Statement = doc.Statement.concat(this.getStatementsForEffect.call(this, "Deny", this.denyMethods));

    policy.policyDocument = doc;

    return policy;
  }
}