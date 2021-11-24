// @ts-check
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { randomUUID } = require('crypto');
// @ts-ignore
const Registration = mongoose.model('Registration', new Schema({ registered: Date, name: String, waitlist: Boolean, key: String, email: String, _course: { type: Schema.Types.ObjectId, ref: 'Course' } }));
// @ts-ignore
const Course = mongoose.model('Course', new Schema({ name: String, location: String, spots: Number, time: String, duration: Number, date: Date, registered: [{ type: Schema.Types.ObjectId, ref: 'Registration' }] }));
const https = require('https');

module.exports.get = async function (event, context) {
    const regKey = decodeURIComponent(event.queryStringParameters.regKey);

    if (!regKey) {
        return respond({ message: "error" }, 400);
    }

    await connectDB();
    const registration = await Registration.findOne({ key: regKey }).populate("_course");

    if (!registration) {
        return respond({ message: "no registration found" }, 404);
    }

    const sanitized = registration.toObject();
    sanitized.email = undefined;

    return respond({ registration: sanitized });
}

module.exports.cancel = async function (event, context) {
    const regKey = decodeURIComponent(event.queryStringParameters.regKey);

    if (!regKey) {
        return respond({ message: "error" }, 400)
    }

    await connectDB();

    const registration = await Registration.findOne({ key: regKey }).populate("_course");
    if (!registration) {
        return respond({ message: "not found" }, 404)
    }

    const course = await Course.findById(registration._course._id).populate("registered");
    const nextInLine = course.registered.filter(f => f.waitlist).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    if (nextInLine) {
        nextInLine.waitlist = false;

        if (nextInLine.email) {
            const data = {
                subject: "A spot opened up!",
                name: nextInLine.name,
                key: nextInLine.key,
                course: course.name,
                time: course.time,
                date: course.date.toDateString(),
            }
            await sendEmail({ name: nextInLine.name, email: nextInLine.email }, "4647bb83-adb5-4547-9ff3-97ea507ac74a", data);
        }
        nextInLine.email = undefined;
        await nextInLine.save();
    }
    await registration.delete();

    return respond({ message: "canceled" });
}

module.exports.notify = async function (event, context) {
    const { key, email } = JSON.parse(event.body);
    const regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

    if (![key, email].every(Boolean) || !regex.test(email)) {
        return respond({ message: "error" }, 400);
    }
    await connectDB();

    const reg = await Registration.findOne({ key });
    if (!reg) {
        return respond({ message: "not found" }, 404);
    }
    reg.email = email;
    await reg.save();

    return respond({ message: "saved" });

}

module.exports.create = async function (event, context) {
    const { name, course, lastKey } = JSON.parse(event.body);

    if (![name, course].every(Boolean)) {
        return respond({ message: "error" }, 400);
    }

    await connectDB();
    // Check if name and key was submitted before
    if (lastKey) {
        const lastReg = await Registration.findOne({ key: lastKey, name });
        if (lastReg) {
            return respond({ registration: { ...lastReg.toObject(), registeredTwice: true } });
        }
    }

    const registeredCourse = await Course.findById(course).exec();
    if (!registeredCourse) {
        return respond({ message: "error" }, 400);
    }

    // generate registration key
    // TODO: change encoding to base64url
    const key = Buffer.from(randomUUID(), "hex").toString("base64").replace(/=/gm, "").replace(/+/gm, "#");

    const waitlist = registeredCourse.spots <= registeredCourse.registered.length;
    const registration = await new Registration({ registered: new Date(), name, waitlist, key, _course: registeredCourse._id }).save();
    registeredCourse.registered.push(registration._id);

    await registeredCourse.save();
    return respond({ registration });
}

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

function connectDB(collection = "Volleyball") {
    if (mongoose.connection.readyState) { return; }

    const url = `mongodb+srv://${process.env.db_user}:${process.env.db_pw}@volleyballserverlessins.mddzc.mongodb.net/${collection}?retryWrites=true&w=majority`;
    return mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
}

/**
 * @param {{ email: string; name: string; }} recipient
 * @param {string} [template_id]
 * @param {any} [data]
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