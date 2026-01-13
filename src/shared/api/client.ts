import createClient from 'openapi-fetch';
import type { paths } from './schema';

export const client = createClient<paths>({baseUrl: "https://musicfun.it-incubator.app/api/1.0/", headers: {
    'api-key': "2892e453-fa01-42fb-9adc-33d6c592c78d"
}})