// @ts-check
const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-central-1' });

module.exports.sendEmail = async function (event, context) {
    const SES = new AWS.SES({ apiVersion: '2010-12-01' });
    const Source = (await SES.listIdentities().promise()).Identities[0];

    const params = {
        Destination: {
            CcAddresses: [],
            ToAddresses: [Source]
        },
        Source,
        Template: "OpenSpot",
        TemplateData: JSON.stringify({ subject: "A course spot opened up for you! 🏐", name: "NAME", key: "#####", course: "", time: "", date: "" })
    };

    try {
        const data = await SES.sendTemplatedEmail(params).promise();
        console.log(data.MessageId);
    } catch (error) {
        console.error(error, error.stack)
    }
}