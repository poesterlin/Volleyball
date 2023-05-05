import { env } from "$env/dynamic/private";
import mongoose from "mongoose";


export async function connectDB(collection = "Volleyball") {
    if (mongoose.connection.readyState === 1) {
        return;
    }

    const url = `mongodb+srv://${env.DB_USER}:${env.DB_PW}@volleyballserverlessins.mddzc.mongodb.net/${collection}?retryWrites=true&w=majority`;
    // @ts-expect-error
    return mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
}