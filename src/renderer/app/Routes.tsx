import { Route, Routes as ReactRoutes } from 'react-router'
import HomePage from '@renderer/pages/page'
import SettingsPage from '@renderer/pages/settings/page'
import GamePage from '@renderer/pages/game/page'
import ProfilePage from '@renderer/pages/game/profile/page'
import ModsPage from '@renderer/pages/game/profile/mods/page'
import ModPage from '@renderer/pages/game/profile/mods/[modId]/page'

export default function Routes() {
    return (
        <ReactRoutes>
            <Route path="/" element={<HomePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/game/:gameId" element={<GamePage />} />
            <Route path="/game/:gameId/profile/:profileId" element={<ProfilePage />} />
            <Route path="/game/:gameId/profile/:profileId/mods" element={<ModsPage />} />
            <Route path="/game/:gameId/profile/:profileId/mods/:modId" element={<ModPage />} />
        </ReactRoutes>
    )
}
