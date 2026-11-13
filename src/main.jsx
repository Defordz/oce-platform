import React from 'react'
import ReactDOM from 'react-dom/client'
// Polices servies avec l'application (aucun appel à un service de polices externe).
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/source-serif-4/600.css'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
