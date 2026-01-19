import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { client } from "../shared/api/client"
import { Pagination } from "../shared/ui/pagination/pagination"
import { useState } from "react"


export const Playlists = () => {

    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')

    const query = useQuery({
        queryKey: ['playlists', {page, search}],
        queryFn: async ({
            signal
        }) => {
            const response = await client.GET('/playlists', {
                params: {
                    query: {
                        pageNumber: page,
                        search: search || undefined
                    }
                },
                signal
            })
            if (response.error) {
                throw (response as unknown as {error: Error}).error!
            }
            return response.data
        },
        placeholderData: keepPreviousData,
    })

    console.log('fetchStatus:' + query.fetchStatus)
    console.log('status:' + query.status)

    if (query.status === 'pending') return <span>Loading...</span>
    if (query.isError) return <span>{JSON.stringify(query.error.message)}</span>

    return <div>
        <div>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" />
        </div>
        <hr />
        <Pagination currentPage={page} 
            pagesCount={query.data.meta.pagesCount} 
            onPageNumberChange={setPage} 
            isFetching={query.isFetching} />
        <ul>
            {query.data.data.map(playlist => (
                <li key={playlist.id}>
                    {playlist.attributes.title}
                </li>
            ))}
        </ul>
    </div>
}