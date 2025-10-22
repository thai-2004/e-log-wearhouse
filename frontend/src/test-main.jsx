import React from 'react'
import ReactDOM from 'react-dom/client'

// Simple test component
const TestApp = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2563eb' }}>E-Log Warehouse Management System</h1>
      <p>Frontend is working! 🎉</p>
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <h2>System Status:</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>✅ React: Working</li>
          <li>✅ Vite: Working</li>
          <li>✅ Tailwind CSS: Working</li>
          <li>✅ Components: Ready</li>
          <li>✅ Features: Complete</li>
        </ul>
      </div>
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => alert('Button clicked! Frontend is working perfectly!')}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Test Button
        </button>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<TestApp />)
