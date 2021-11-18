const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Registration = mongoose.model('Registration', new Schema({ registered: Date, name: String, waitlist: Boolean, key: String, _course: { type: Schema.Types.ObjectId, ref: 'Course' } }));
const Course = mongoose.model('Course', new Schema({ name: String, location: String, spots: Number, time: String, duration: Number, date: Date, registered: [{ type: Schema.Types.ObjectId, ref: 'Registration' }] }));

module.exports.get = async function (event, context) {
    await connectDB();
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    const courses = await Course.find({ date: { $gte: yesterday } }).sort({ date: 1 }).populate('registered');

    return respond({
        courses: courses.map((c) => {
            c.registered = c.registered.length;
            return c;
        })
    });
}

module.exports.details = async function (event, context) {
    await connectDB();
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    const inTwoWeeks = new Date(new Date().setDate(new Date().getDate() + 14));
    const courses = await Course.find({ date: { $gte: yesterday, $lte: inTwoWeeks } }).sort({ date: 1 }).populate('registered');

    return respond({ courses });
}

module.exports.delete = async function (event, context) {
    await connectDB();
    const { id } = JSON.parse(event.body);
    const course = await Course.findById(id);
    for (const registration of course.registered) {
        await registration.delete()
    }
    await course.delete();
    return respond({ message: "deleted" });
}

module.exports.create = async function (event, context) {
    await connectDB();
    const { name, location, spots, time, duration, date } = JSON.parse(event.body);
    if (![name, location, spots, time, duration, date].every(Boolean)) {
        return respond({ message: "error" }, 400);
    }

    await new Course({ name, location, spots, time, duration, date, registered: [] }).save();

    // auto delete courses older than yesterday
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    const courses = await Course.find({ date: { $lte: yesterday } }).sort({ date: 1 }).populate('registered');

    for (const course of courses) {
        for (const reg of course.registered) {
            console.log(reg);
            await reg.delete();
        }
        course.delete();
    }

    return respond({ message: "created" });
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