import { connectDB } from '$lib/db/connection';
import { DB } from '$lib/db/schema';
import { error } from '@sveltejs/kit';

export const load = (async () => {
    try {
        await connectDB();

        const courses = await DB.Course.find({
            publishOn: {
                $lt: new Date()
            }
        }).sort({ date: 1, time: 1 });
        return {
            courses: courses.map((c) => {
                const resp = c.toObject();
                resp._id = c._id.toString();
                resp.registered = resp.registered.length as any;
                return resp;
            })
        };
    } catch (err: any) {
        console.error(err);
        throw error(500, err.toString())
    }
});