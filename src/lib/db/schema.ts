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
    await DbSchema.Course.findByIdAndUpdate(reg._course, { $pullAll: { registered: [reg._id] } });
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

export class DbSchema {
    private static _registration = mongoose.models.Registration ?? mongoose.model('Registration', registrationSchema)
    private static _course = mongoose.models.Course ?? mongoose.model('Course', courseSchema)
    private static _notification = mongoose.models.Notification ?? mongoose.model('Notification', notificationSchema)
    private static _strike = mongoose.models.Strike ?? mongoose.model('Strike', strikeSchema)

    static get Registration() {
        return mongoose.models.Registration ?? DbSchema._registration;
    }
    static get Course() {
        return mongoose.models.Course ?? DbSchema._course;
    }
    static get Notification() {
        return mongoose.models.Notification ?? DbSchema._notification;
    }
    static get Strike() {
        return mongoose.models.Strike ?? DbSchema._strike;
    }
}
