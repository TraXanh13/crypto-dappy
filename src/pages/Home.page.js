import React from 'react'
import { useHistory } from "react-router-dom"
import Header from '../components/Header'
import "./Home.page.css"

export default function Home() {
  const history = useHistory()

  return (
    <>
      <Header
        title={<><span className="highlight">Code</span>Ninjas</>}
        subtitle={<>The ninja <span className="highlight">collectible game</span> on the blockchain</>}
      />
      <img className="header-image"
        alt="Header"
        onClick={() => history.push("/packs")}
        src={`${process.env.PUBLIC_URL}/assets/PackDrops.png`}
      />
    </>
  )
}
