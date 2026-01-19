import createClient, { type Middleware } from 'openapi-fetch';
import type { paths } from './schema';

const authMiddleware: Middleware = {
    onRequest({request, options}) {
        const accessToken = localStorage.getItem('musicfun-token')
        if (accessToken) {
            request.headers.set('Authorization', `Bearer ${accessToken}`)
        }
        return request
    },
    onResponse({response}) {
        if (!response.ok) {
            throw new Error(`${response.url}: ${response.status} ${response.statusText}`)
        }
        return response
    }
}

export const client = createClient<paths>({baseUrl: "https://musicfun.it-incubator.app/api/1.0/", headers: {
    'api-key': "2892e453-fa01-42fb-9adc-33d6c592c78d"
}})

client.use(authMiddleware)