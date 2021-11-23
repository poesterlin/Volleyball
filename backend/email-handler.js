// @ts-check
const https = require('https');

module.exports.sendEmail = async function (event, context) {
    const data = {
        subject: "A spot opened up!",
        name: "{{name}}",
        key: "{{key}}",
        course: "{{course}}",
        time: "{{time}}",
        date: "{{date}}",
    }

    const body = {
        email: {
            substitution_data: data,
            recipients: [
                {
                    address: {
                        email: "philip.oesterlin@gmail.com",
                        name: "Philip Oesterlin"
                    },
                }
            ],
            content: {
                template_id: "4647bb83-adb5-4547-9ff3-97ea507ac74a",
                email_rfc822: "Content-Type: text/plain\r\nTo: \"{{address.name}}\"",
                from: {
                    name: "Volleyball Registration Service",
                    email: "volleyball@oesterlin.dev",
                },
            }
        }
    };

    /** @type{https.RequestOptions} */
    const options = {
        'method': 'POST',
        'hostname': 'app.jetsend.com',
        'path': '/api/v1/transmission/email',
        'headers': {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-API-KEY': process.env.email_key,
            'Authorization': 'Bearer ' + process.env.email_key
        },
    };

    await new Promise(resolve => {
        const req = https.request(options, (res) => {
            const chunks = [];

            res.on("data", (chunk) => {
                chunks.push(chunk);
            });

            res.on("end", (_chunk) => {
                const body = Buffer.concat(chunks);
                console.log(body.toString());
                resolve(body.toString())
            });

            res.on("error", (error) => {
                console.error(error);
            });
        });

        req.write(JSON.stringify(body));
        req.end();
    })
}