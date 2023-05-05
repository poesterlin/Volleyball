import { connectDB } from '$lib/db/connection';
import { DB } from '$lib/db/schema';
import { error } from '@sveltejs/kit';

export const load = (async () => {
    try {
        await connectDB();

        const courses = await DB.Course.find({ publishOn: { $lt: new Date() } }).sort({ date: 1, time: 1 });

        const sanitized = courses.map((c) => {
            const resp = c.toObject();
            resp._id = c._id.toString();
            resp.registered = resp.registered.length as any;
            resp.date = new Date(c.date!);
            return resp;
        });

        const dates = sanitized.reduce((map, c) => map.set(c.date!.toDateString(), true), new Map());

        const blocks = Array.from(dates.keys()).map((date) => ({
            date,
            courses: sanitized.filter((c) => c.date!.toDateString() === date)
        }));
        return { blocks };
    } catch (err: any) {
        throw error(500, JSON.stringify(err) + " +++ error");
    }
});