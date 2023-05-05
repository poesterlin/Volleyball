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
    private static _registration = mongoose.models.Registration ?? mongoose.model('Registration', registrationSchema, "Volleyball", { overwriteModels: true });
    private static _course = mongoose.models.Course ?? mongoose.model('Course', courseSchema, "Volleyball", { overwriteModels: true });
    private static _notification = mongoose.models.Notification ?? mongoose.model('Notification', notificationSchema, "Volleyball", { overwriteModels: true });
    private static _strike = mongoose.models.Strike ?? mongoose.model('Strike', strikeSchema, "Volleyball", { overwriteModels: true });

    static get Registration() {
        return mongoose.models.Registration ?? DB._registration;
    }
    static get Course() {
        return mongoose.models.Course ?? DB._course;
    }
    static get Notification() {
        return mongoose.models.Notification ?? DB._notification;
    }
    static get Strike() {
        return mongoose.models.Strike ?? DB._strike;
    }
}
