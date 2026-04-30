import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './tokens.css'
import './base.css'
import './app.css'
import { App } from './app/App'

;(function () {
  const stored = sessionStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.setAttribute('data-theme', stored || (prefersDark ? 'dark' : 'light'))
})()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
