// @ts-check

const mongoose = require('mongoose');
const { connectDB, respond, middleOfDay, addDays } = require('./helpers');
const Schema = mongoose.Schema;
const Registration = mongoose.model('Registration', new Schema({ registered: Date, name: String, waitlist: Boolean, key: String, email: String, _course: { type: Schema.Types.ObjectId, ref: 'Course' } }));
const Course = mongoose.model('Course', new Schema({ name: String, location: String, publishOn: Date, spots: Number, time: String, duration: Number, date: Date, registered: [{ type: Schema.Types.ObjectId, ref: 'Registration' }] }));

module.exports.get = async function (event, context) {
    await connectDB();

    const courses = await Course.find({
        publishOn: {
            $lt: new Date()
        }
    }).sort({ date: 1, time: 1 });

    return respond({
        courses: courses.map((c) => {
            const resp = c.toObject();
            resp.registered = resp.registered.length;
            return resp;
        })
    });
}

module.exports.details = async function (event, context) {
    try {

        await connectDB();
        const courses = await Course.find().sort({ date: 1, time: 1 }).populate('registered');

        return respond({
            courses: courses.map((c) => {
                const resp = c.toObject();
                resp.registered = resp.registered.map(e => {
                    e.email = Boolean(e.email);
                    return e;
                });
                return resp;
            })
        });
    } catch (error) {
        console.log(error);
        return respond({ message: error })
    }
}

module.exports.delete = async function (event, context) {
    try {
        const id = decodeURIComponent(event.queryStringParameters.id);
        if (!id) {
            return respond({ message: "not found" }, 400)
        }
        await connectDB();
        const course = await Course.findById(id);
        if (!course) {
            return respond({ message: "not found" }, 404)
        }
        if (course.registered.length > 0) {
            await Registration.deleteMany({ _id: { $in: course.registered } });
        }
        await Course.findByIdAndDelete(course._id);
        return respond({ message: "deleted" });
    } catch (error) {
        console.log(error);
        return respond({ message: error })
    }
}

module.exports.create = async function (event, context) {
    try {
        await connectDB();
        const { name, location, spots, time, duration, date, publishOn } = JSON.parse(event.body);
        if (![name, location, spots, time, duration, date, publishOn].every(Boolean)) {
            return respond({ message: "error" }, 400);
        }

        await new Course({ name, location, spots, time, duration, date, publishOn: middleOfDay(new Date(publishOn)), registered: [] }).save();

        // auto delete courses older than yesterday
        const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
        const courses = await Course.find({ date: { $lte: yesterday } }).sort({ date: 1 }).populate('registered');

        if (courses.length > 0) {
            await Registration.deleteMany({ _id: { $in: courses.flatMap((c) => c.registered.map(r => r._id)) } });
            await Course.deleteMany({ _id: { $in: courses.map(r => r._id) } });
        }

        return respond({ message: "created" });
    } catch (error) {
        console.log(error);
        return respond({ message: error })
    }
}
