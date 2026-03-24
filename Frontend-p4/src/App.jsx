import { useState } from 'react';
import tokenStore from './store/tokenStore.js';
import AppRoutes from './AppRouters.jsx';

import Login from './pages/Login.jsx';
import Register from "./pages/Register.jsx";
import Leads from './pages/Leads.jsx';
import Header from './components/Header.jsx';
import Aside from './components/Aside.jsx';
import Footer from './components/Footer.jsx';
import './index.css';

// App.jsx
function App() {
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para o menu
    const token = tokenStore((state) => state.token);

    return (
        <div className={token ? "layout-grid" : "layout-login-screen"}>
            {/* Passamos a função para o Header fechar/abrir */}
            <Header toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />

            {token && (
                /* Se isMenuOpen for true, a classe 'open' ativa o 'left: 0' do CSS */
                <aside className={`main-aside ${isMenuOpen ? 'open' : ''}`}>
                    <Aside />
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
