import React from 'react'
import Header from '../organisms/Header/Header'
import FormCreateGame from '../molecules/FormCreateGame/FormCreateGame'
import './App.css'

const App = () => {
  return (
    <>
      <Header />
      <main className="app-container">
        <FormCreateGame />
      </main>
    </>
  )
}

export default App
