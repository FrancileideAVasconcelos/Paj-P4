import { useState } from 'react';
import tokenStore from './store/tokenStore.js';
import AppRoutes from './AppRouters.jsx';

import Header from './components/Header.jsx';
import Aside from './components/Aside.jsx';
import Footer from './components/Footer.jsx';
import './index.css';

function App() {
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para o menu
    const token = tokenStore((state) => state.token);

    return (
        <div className={token ? "layout-grid" : "layout-login-screen"}>
            <Header toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />

            {token && (
                <aside className={`main-aside ${isMenuOpen ? 'open' : ''}`}>
                    <Aside fecharMenu={() => setIsMenuOpen(false)} />
                </aside>
            )}

            <main className="content">
                <AppRoutes token={token} />
            </main>
            <Footer />
        </div>
    );
}

export default App;