import type { Handle } from "@sveltejs/kit"

export const handle: Handle = async ({ event, resolve }) => {
    // if (event.url.pathname.startsWith("/admin")) {
    //     event.locals.user = authenticateUser(event);

    //     if (event.locals.user?.role !== "ADMIN") {
    //         throw redirect(303, "/")
    //     }
    // }


    return resolve(event);
}