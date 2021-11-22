// @ts-check
const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-central-1' });

module.exports.sendEmail = async function (event, context) {
    const identity = (await new AWS.SES({ apiVersion: '2010-12-01' }).listIdentities().promise()).Identities[0];

    const params = {
        Destination: {
            CcAddresses: [],
            ToAddresses: [identity]
        },
        Source: identity,
        Template: "test",
        TemplateData: JSON.stringify({ subject: "Support!!!", user: "world" })
    };

    try {
        const data = await new AWS.SES({ apiVersion: '2010-12-01' }).sendTemplatedEmail(params).promise();
        console.log(data.MessageId);
    } catch (error) {
        console.error(error, error.stack)
    }
}