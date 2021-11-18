const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { randomUUID } = require('crypto');
const Registration = mongoose.model('Registration', new Schema({ registered: Date, name: String, waitlist: Boolean, key: String, _course: { type: Schema.Types.ObjectId, ref: 'Course' } }));
const Course = mongoose.model('Course', new Schema({ name: String, location: String, spots: Number, time: String, duration: Number, date: Date, registered: [{ type: Schema.Types.ObjectId, ref: 'Registration' }] }));

module.exports.get = async function (event, context) {
    const regKey = decodeURIComponent(event.queryStringParameters.regKey);

    await connectDB();
    const registration = await Registration.findOne({ key: regKey }).populate("_course");

    return respond({ registration });
}

module.exports.cancel = async function (event, context) {
    const regKey = decodeURIComponent(event.queryStringParameters.regKey);

    await connectDB();
    const registration = await Registration.findOne({ key: regKey }).populate("_course");
    if (!registration) {
        return respond({ message: "not found" }, 404)
    }

    // TODO: check order
    const course = await Course.findById(registration._course._id).populate("registered");
    const nextInLine = await course.registered.filter(f => f.waitlist).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    if (nextInLine) {
        nextInLine.waitlist = false;
        await nextInLine.save();
    }
    await registration.delete();

    return respond({ message: "canceled" });
}

module.exports.create = async function (event, context) {
    await connectDB();
    const { name, course } = JSON.parse(event.body);

    if (![name, course].every(Boolean)) {
        return respond({ message: "error" }, 400);
    }

    const registeredCourse = await Course.findById(course).exec();
    if (!registeredCourse) {
        return respond({ message: "error" }, 400);
    }

    // generate registration key
    // TODO: change encoding to base64url
    const key = Buffer.from(randomUUID(), "hex").toString("base64").replace(/=/gm, "");

    const registration = await new Registration({ registered: new Date(), name, waitlist: registeredCourse.spots < registeredCourse.registered.length - 1, key, _course: registeredCourse._id }).save();
    registeredCourse.registered.push(registration._id)
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
    const url = `mongodb+srv://${process.env.db_user}:${process.env.db_pw}@volleyballserverlessins.mddzc.mongodb.net/${collection}?retryWrites=true&w=majority`;
    return mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
}