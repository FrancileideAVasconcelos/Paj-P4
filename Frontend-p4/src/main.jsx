import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // Importa aqui!
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter> {/* O Router envolve a App INTEIRA */}
            <App />
        </BrowserRouter>
    </React.StrictMode>,
)