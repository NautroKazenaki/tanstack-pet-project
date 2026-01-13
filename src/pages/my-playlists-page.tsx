
// import { client } from '../shared/api/client'
// import { useQuery } from '@tanstack/react-query'
import { Playlists } from '../features/playlists'

function MyPlaylistsPage() {
//   const query = useQuery({
//     // staleTime: Infinity,
//     // refetchOnMount: false,
//     // refetchOnWindowFocus: false,
//     // refetchOnReconnect: false,
//     queryKey: ['playlists'],
//     queryFn: () => client.GET('/playlists')
//   })

  return (
    <div>
      <h2>My playlists</h2>
      <Playlists />
    </div>
  )
}

export default MyPlaylistsPage
