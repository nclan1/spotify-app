import { useState } from 'react'

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>display spotify profile</h1>

      <section className='profile'>
        <h2>logged in as <span className='displayName'></span></h2>
        <span className='avatar'></span>
        <ul>
          <li>user id: <span className='id'></span></li>
          <li>email: <span className='email'></span></li>
          <li>spotify uri: <a className='uri'></a></li>
          <li>link: <a className='url' href="#"></a></li>
          <li>profile image: <span className='imgUrl'></span></li>
        </ul>
      </section>
    </>
  )
}

export default App
