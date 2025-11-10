import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState<number>(0)

  return (
    <div className="app">
      <header className="header">
        <h1>My React App</h1>
        <nav>
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main className="main">
        <section className="hero">
          <h2>Welcome to Your React + Vite Project</h2>
          <p>Start building something amazing!</p>
        </section>

        <section className="demo">
          <h3>Interactive Demo</h3>
          <button onClick={() => setCount(count + 1)}>
            Count: {count}
          </button>
          <p>Click the button to see React in action</p>
        </section>

        <section className="features">
          <h3>Why This Stack?</h3>
          <div className="feature-grid">
            <div className="feature">
              <h4>⚡ Fast</h4>
              <p>Vite provides lightning-fast hot module replacement</p>
            </div>
            <div className="feature">
              <h4>🎯 Modern</h4>
              <p>React with hooks and functional components</p>
            </div>
            <div className="feature">
              <h4>🔧 Flexible</h4>
              <p>Easy to extend with APIs and databases later</p>
            </div>
            <div className="feature">
              <h4>📘 TypeScript</h4>
              <p>Type safety and better developer experience</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2024 My React App. Built with React + Vite + TypeScript</p>
      </footer>
    </div>
  )
}

export default App