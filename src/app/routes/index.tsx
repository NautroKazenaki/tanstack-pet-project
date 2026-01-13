import { createFileRoute } from "@tanstack/react-router";
import PlaylistsPage from "../../pages/playlists-page";

export const Route = createFileRoute('/')({
    component: PlaylistsPage
})
