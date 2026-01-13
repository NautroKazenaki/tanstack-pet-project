
import { Playlists } from '../features/playlists'
import { client } from '../shared/api/client'
import { useQuery } from '@tanstack/react-query'

function PlaylistsPage() {
  const query = useQuery({
    // staleTime: Infinity,
    // refetchOnMount: false,
    // refetchOnWindowFocus: false,
    // refetchOnReconnect: false,
    queryKey: ['playlists'],
    queryFn: () => client.GET('/playlists')
  })

  return (
    <div>
      <h2>All Playlists</h2>
      <Playlists />
    </div>
  )
}

export default PlaylistsPage
