// @ts-check
let AWS;
try {
    AWS = require('aws-sdk');
} catch {
    console.log("AWS sdk not found")
}
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { randomUUID } = require('crypto');
var stringSimilarity = require("string-similarity");

const { respond, connectDB, inNDays, endOfDay, sendEmail } = require('./helpers');

const webpush = require('web-push');
const publicVapidKey = process.env.VAPID_PUBLIC;
const privateVapidKey = process.env.VAPID_PRIVATE;
webpush.setVapidDetails('https://volleyballhtwg.netlify.app', publicVapidKey, privateVapidKey);

const regSchema = new Schema({ registered: Date, name: String, suspectedStrike: Boolean, waitlist: Boolean, key: String, email: String, _course: { type: Schema.Types.ObjectId, ref: 'Course' } });

regSchema.pre('remove', { document: true, query: false }, async function () {
    const reg = this;
    await Course.findByIdAndUpdate(reg._course, { $pullAll: { registered: [reg._id] } });
});

// @ts-ignore
const Registration = mongoose.model('Registration', regSchema);
// @ts-ignore
const Course = mongoose.model('Course', new Schema({ name: String, location: String, spots: Number, time: String, duration: Number, date: Date, registered: [{ type: Schema.Types.ObjectId, ref: 'Registration' }] }));
// @ts-ignore
const Notification = mongoose.model('Notification', new Schema({ subscription: Object }));

// @ts-ignore
const Strike = mongoose.model('Strike', new Schema({ name: String, date: Date }));



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
    if (registration.waitlist) {
        sanitized.waitlistSpot = await Registration.countDocuments({
            _course: registration._course._id,
            waitlist: true,
            registered: {
                $lte: registration.registered
            }
        });
    }

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
    if (nextInLine && !registration.waitlist) {
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
    const striked = await addStrike(registration.name, course.date, course.time)
    await registration.delete();

    return respond({ message: "canceled", striked });
}



module.exports.registerTrainer = async function (event, context) {
    await connectDB();

    for (const record of event.Records) {
        const attr = record.messageAttributes;
        const courseID = attr.courseID.stringValue;
        const trainerName = attr.trainerName.stringValue;
        const trainerEmail = attr.trainerEmail.stringValue;

        if (![courseID, trainerName, trainerEmail].every(Boolean)) {
            continue;
        }

        const registeredCourse = await Course.findById(courseID).exec();
        const key = Buffer.from(randomUUID(), "hex").toString("base64").replace(/=/gm, "").replace(/\+/gm, "#");
        const waitlist = registeredCourse.spots <= registeredCourse.registered.length;
        const registration = await new Registration({ registered: new Date(), name: trainerName, waitlist, key, _course: registeredCourse._id, email: trainerEmail }).save();

        registeredCourse.registered.push(registration._id);
        await registeredCourse.save();
        console.log(registeredCourse)

        const data = {
            subject: "Volleyball Trainer Auto-Login",
            name: trainerName,
            key,
            course: registeredCourse.name,
            time: registeredCourse.time,
            date: registeredCourse.date.toDateString(),
        }
        await sendEmail({ name: trainerName, email: trainerEmail }, "3b97f37b-a292-46f8-8a59-40f8698b2825", data);
    }

    return true;
}

module.exports.scheduleTrainer = async function (event, context) {
    await connectDB();

    const coursesToday = await Course.find({
        date: {
            $gte: inNDays(7),
            $lte: endOfDay(inNDays(7))
        }
    })

    const { trainer } = JSON.parse(process.env.trainer_json);

    const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

    const registrations = coursesToday.flatMap(c => trainer.filter(t => t.courses.includes(c.name)).map((t) => ({ course: c, trainer: t })))

    const proms = registrations.map(async (config) => {
        const params = {
            DelaySeconds: Math.floor(Math.random() * 15 * 60), // 15 minutes max
            MessageAttributes: {
                courseID: {
                    DataType: "String",
                    StringValue: config.course._id.toString()
                },
                trainerName: {
                    DataType: "String",
                    StringValue: config.trainer.name
                },
                trainerEmail: {
                    DataType: "String",
                    StringValue: config.trainer.email
                },
            },
            MessageBody: "Course Registrations Open",
            QueueUrl: process.env.queue_url
        };
        return sqs.sendMessage(params).promise();
    });

    await Promise.all(proms);

    return respond({ message: "created", coursesToday, trainer, registrations });
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


module.exports.registerPushNotification = async function (event, context) {
    const { subscription } = JSON.parse(event.body);

    if (!subscription) {
        return respond({ message: "error" }, 400);
    }

    await connectDB();
    await new Notification({ subscription }).save();

    const payload = JSON.stringify({ title: 'test' });

    webpush.sendNotification(subscription, payload).catch(error => {
        console.error(error.stack);
    });

    return respond({ message: "notification registered" });
}

module.exports.create = async function (event, context) {
    const { name, course, lastKey } = JSON.parse(event.body);

    if (![name, course].every(Boolean)) {
        return respond({ message: "error" }, 400);
    }

    await connectDB();
    // Check if name and key was submitted before
    // if (lastKey) {
    //     const lastReg = await Registration.findOne({ key: lastKey, name, course });
    //     if (lastReg) {
    //         return respond({ registration: { ...lastReg.toObject(), registeredTwice: true } });
    //     }
    // }

    const suspectedStrike = await hasStrike(name);

    const registeredCourse = await Course.findById(course).exec();
    if (!registeredCourse) {
        return respond({ message: "error" }, 400);
    }

    // generate registration key
    // TODO: change encoding to base64url
    const key = Buffer.from(randomUUID(), "hex").toString("base64").replace(/=/gm, "").replace(/\+/gm, "-");

    const waitlist = suspectedStrike || registeredCourse.spots <= registeredCourse.registered.length;
    const registration = await new Registration({ registered: new Date(), suspectedStrike, name, waitlist, key, _course: registeredCourse._id }).save();
    registeredCourse.registered.push(registration._id);

    await registeredCourse.save();
    return respond({ registration });
}

/**
 * 
 * @param {string} name 
 * @param {Date} curseDate 
 * @param {string} curseTime 
 */
async function addStrike(name, curseDate, curseTime) {
    try {
        const [h, m] = curseTime.split(":");
        const time = curseDate.setHours(parseInt(h), parseInt(m));

        const cutoff = 1 * 60 * 60 * 1000;

        const tooClose = time - Date.now() < cutoff;

        if (tooClose) {
            await new Strike({ name, date: new Date() }).save();
        }

        return tooClose;
    } catch (error) {
        console.log(error);
        return false;
    }
}
module.exports.getStrikes = async function (event, context) {
    await connectDB();
    const strikes = await Strike.find()
    return respond({ strikes });
}

module.exports.clearStrike = async function (event, context) {
    const regKey = decodeURIComponent(event.queryStringParameters.regKey);

    if (!regKey) {
        return respond({ message: "error" }, 400);
    }

    await connectDB();
    const registration = await Registration.findOne({ key: regKey }).populate("_course");

    if (!registration) {
        return respond({ message: "no registration found" }, 404);
    }
    const nowStriked = !registration.suspectedStrike;

    if (nowStriked) {
        await new Strike({ name: registration.name, date: new Date() }).save();
    }

    const registeredCourse = registration._course;
    const waitlist = nowStriked || registeredCourse.spots < registeredCourse.registered.length;
    await Registration.findOneAndUpdate({ key: regKey }, { suspectedStrike: nowStriked, waitlist });
    return respond({ message: "cleared" });
}


/**
 * 
 * @param {string} name 
 */
async function hasStrike(name) {
    try {
        const strikes = await Strike.find({ date: { $gt: inNDays(-7) }});

        const match = strikes
            .map(s => stringSimilarity.compareTwoStrings(s.name, name));

        return Math.max(...match) > 0.9;
    } catch (error) {
        console.log(error);
        return false;
    }
}
