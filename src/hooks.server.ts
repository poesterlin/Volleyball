import { redirect, type Handle } from "@sveltejs/kit";

const cutoffDate = new Date("2023-11-18T10:00:00.000Z");

export const handle: Handle = async ({ event, resolve }) => {
    const isPastCutoff = new Date() > cutoffDate;

    if (isPastCutoff) {
        throw redirect(301, "https://volleyball.oesterlin.dev");
    }

    return resolve(event);
}