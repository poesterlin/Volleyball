
import { env } from '$env/dynamic/private';
import jwt from 'jsonwebtoken';
import { redirect, type RequestEvent } from '@sveltejs/kit';

export type User = {
    id: number
    email: string
    role: string
}

export function authenticateUser(event: RequestEvent): User | undefined {
    const { request } = event

    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
        throw redirect(303, "/")
    }

    const tokenParts = authHeader.split(' ');
    const tokenValue = tokenParts[1];

    if (!(tokenParts[0].toLowerCase() === 'bearer' && tokenValue)) {
        throw redirect(303, "/")
    }

    const options = {
        audience: env.AUTH_CLIENT,
    };

    let decoded;
    try {
        decoded = jwt.verify(tokenValue, env.AUTH0_CLIENT_PUBLIC_KEY, options)
    } catch (error) {
        console.log(`Token invalid.`);
        return;
    }

    console.log(decoded);
    const roles = decoded['https://ausowa.netlify.app/role'];

    if (!roles || roles.length !== 1 || roles[0] !== 'Admin') {
        return { id: decoded, email: decoded, role: roles[0] };
    }
}
