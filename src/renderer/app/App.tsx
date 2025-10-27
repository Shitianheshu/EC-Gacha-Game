import { HashRouter as Router } from 'react-router'
import Topbar from '@renderer/components/app/Topbar'
import Notifications from '@renderer/components/app/Notifications'
import PageLayout from '@renderer/app/PageLayout'
import Layout from '@renderer/app/Layout'
import Routes from '@renderer/app/Routes'

export default function App() {
    return (
        <Router>
            <Layout>
                <Topbar />
                <PageLayout>
                    <Routes />
                </PageLayout>
                <Notifications />
            </Layout>
        </Router>
    )
}
