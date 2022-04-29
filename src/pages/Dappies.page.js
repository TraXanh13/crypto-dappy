import React from 'react'

import useDappyTemplates from '../hooks/use-dappy-templates.hook'
import DappyList from '../components/DappyList'
import Header from '../components/Header'
import ErrorLoadingRenderer from '../components/ErrorLoadingRenderer'

export default function Dappies() {
  const { data: dappyTemplates, loading, error } = useDappyTemplates()

  return (
    <>
      <Header
        title={<><span className="highlight">Ninja</span>Store</>}
        subtitle={<>Buy individual <span className="highlight">ninjas</span> in our store</>}
      />
      <ErrorLoadingRenderer loading={loading} error={error}>
        <DappyList dappies={dappyTemplates} store />
      </ErrorLoadingRenderer>
    </>
  )
}
