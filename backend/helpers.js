// @ts-check
const mongoose = require('mongoose');
const https = require('https');

function respond(json, status = 200) {
    const response = {
        statusCode: status,
        headers: {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        body: JSON.stringify(json),
    };
    return response;
}

async function connectDB(collection = "Volleyball") {
    if (mongoose.connection.readyState === 1) { return; }

    const url = `mongodb+srv://${process.env.db_user}:${process.env.db_pw}@volleyballserverlessins.mddzc.mongodb.net/${collection}?retryWrites=true&w=majority`;
    return mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
}

/**
 * @param {{ email: string; name: string; }} recipient
 * @param {string} template_id
 * @param {any} data
 */
async function sendEmail(recipient, template_id, data) {
    const body = {
        email: {
            substitution_data: data,
            recipients: [
                {
                    address: {
                        email: recipient.email,
                        name: recipient.name
                    },
                }
            ],
            content: {
                template_id,
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


const inNDays = (n) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + n);
    return date;
}

const endOfDay = (date) => {
    date.setHours(23, 59, 59, 999);
    return date;
}

module.exports.sendEmail = sendEmail;
module.exports.inNDays = inNDays;
module.exports.endOfDay = endOfDay;
module.exports.respond = respond;
module.exports.connectDB = connectDB;