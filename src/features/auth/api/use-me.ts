import { useQuery } from "@tanstack/react-query"
import { client } from "../../../shared/api/client"

export const useMeQuery = () => {
    const query = useQuery({
        queryKey: ['auth', 'me'],
        queryFn: async () => {
            const response = await client.GET('/auth/me')
            return response.data
        }
    })

    return query
}

