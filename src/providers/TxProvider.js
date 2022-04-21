import React, { useContext, useEffect, useState } from 'react'

import TxDetails from '../components/TxDetails'
import Spinner from '../components/Spinner'
import { getTransactionStatus, send, tx } from '@onflow/fcl'

const txContext = React.createContext()

export default function TxProvider({ children }) {
  const [txs, setTxs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLocalTxs()
    //eslint-disable-next-line
  }, [])

  const renderTxs = () => {
    return (
      <div className='txs__list'>
        {txs.map(tx => <TxDetails id={tx?.id} key={tx?.id} />)}
      </div>
    )
  }

  const getLocalTxs = async () => {
    const txStrings = window.localStorage.getItem('txs')

    if(!txStrings || txStrings.length === 0){
      setLoading(false);
      return;
    }

    const localTxs = txStrings?.split(",")

    let runningTxs = [];

    for (let index = 0; index < localTxs.length; index++) {
      const id = localTxs[index];
      const t = await getTxStatus(id)
      if(t?.status === 4) {
        continue
      }
      tx(id).subscribe(s=> updateTxStatus(s?.status, id))
      runningTxs.push(id)
    }

    localStorage.setItem('txs', runningTxs.toString())
    setTxs(runningTxs.map(t => ({ id: t })))
    setLoading(false)
  }

  const addTx = (txID) => {
    console.log("Add txID")
    let transaction = {id: txID}
    setTxs(prev => [...prev, transaction])
    tx(txID).subscribe(s => updateTxStatus(s?.status, transaction?.id))
    window.localStorage.setItem('txs', [...txs, transaction?.id].toString())
  }

  const updateTxStatus = (status, txID) => {
    // 4 is sealed
    if(status === 4) {
      removeTx(txID);
      return
    }
    let tx = txs.find(t => t.id !== txID);
    let oldTxs = txs.filter(t => t.id !== txID);
    
    if(!tx){
      return;
    } 

    let updatedTxs = {...tx, status};
    setTxs([...oldTxs, updatedTxs]);
  }

  const removeTx = (txID) => {
    let newTxs = txs.filter(t => t.id !== txID)
    setTxs(newTxs)
  }

  const getTxStatus = async(txID) => {
    const status = await send([
      getTransactionStatus(txID)
    ])
    return status
  }

  if (loading) return <Spinner />

  return (
    <txContext.Provider value={{
      runningTxs: txs.length !== 0,
      addTx,
    }}>
      {renderTxs()}
      {children}
    </txContext.Provider>
  )
}

export function useTxs() {
  return useContext(txContext)
}