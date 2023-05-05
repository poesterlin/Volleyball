import mongoose, { Schema } from "mongoose";

const registrationSchema = new Schema({
    registered: Date,
    name: String,
    suspectedStrike: Boolean,
    waitlist: Boolean,
    key: String,
    email: String,
    _course: { type: Schema.Types.ObjectId, ref: 'Course' }
});

registrationSchema.pre('deleteOne', { document: true, query: false }, async function (this) {
    const reg = this;
    await DB.Course.findByIdAndUpdate(reg._course, { $pullAll: { registered: [reg._id] } });
});

const courseSchema = new Schema({
    name: String,
    location: String,
    publishOn: Date,
    spots: Number,
    time: String,
    duration: Number,
    date: Date,
    registered: [
        { type: Schema.Types.ObjectId, ref: 'Registration' }
    ]
});

const notificationSchema = new Schema({ subscription: Object });
const strikeSchema = new Schema({ name: String, date: Date })

export class DB {
    private static _registration = mongoose.model('Registration', registrationSchema, "registrations", { overwriteModels: true });
    private static _course = mongoose.model('Course', courseSchema, "courses", { overwriteModels: true });
    private static _notification = mongoose.model('Notification', notificationSchema, "notifications", { overwriteModels: true });
    private static _strike = mongoose.model('Strike', strikeSchema, "strikes", { overwriteModels: true });

    static get Registration() {
        return DB._registration;
    }
    static get Course() {
        return DB._course;
    }
    static get Notification() {
        return DB._notification;
    }
    static get Strike() {
        return DB._strike;
    }
}
