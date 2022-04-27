import { useEffect, useReducer } from 'react'
import { defaultReducer } from '../reducer/defaultReducer'
import { useUser } from '../providers/UserProvider'

import { Pack } from '../utils/PackClass'
import { DEFAULT_PACKS } from '../config/packs.config'
import { mutate, query, tx } from '@onflow/fcl'
import { LIST_PACKS } from '../flow/list-packs.script'
import { GET_PACK } from '../flow/get-pack.script'
import { LIST_DAPPIES_IN_PACK } from '../flow/list-dappies-in-pack.script'
import { useTxs } from '../providers/TxProvider'
import { MINT_DAPPIES_FROM_PACK } from '../flow/mint-dappies-from-pack.tx'
import { GET_FUSD_BALANCE } from '../flow/get-fusd-balance.script'

export default function useDappyPacks() {
  const [state, dispatch] = useReducer(defaultReducer, {
    loading: true,
    error: false,
    data: []
  })
  const { collection, batchAddDappies, getFUSDBalance } = useUser()
  const { runningTxs, addTx } = useTxs()

  useEffect(() => {
    const fetchPacks = async () => {
      dispatch({ type: 'PROCESSING' })
      try {
        const res = await query({
          cadence: LIST_PACKS
        })
        dispatch({ type: 'SUCCESS', payload: res })
      } catch (err) {
        dispatch({ type: 'ERROR' })
      }
    }
    fetchPacks()
  }, [])

  const fetchPackDetails = async (packID) => {
    let res = await query({
      cadence: GET_PACK,
      args: (arg, t) => [arg(packID, t.UInt32)],
    })
    console.log(res)
    return new Pack(res?.familyID, res?.name, res?.price)
  }

  const fetchDappiesOfPack = async (packID) => {
    let res = await query({
      cadence: LIST_DAPPIES_IN_PACK,
      args: (arg, t) => [arg(packID, t.UInt32)]
    })
    return res
  }

  const mintFromPack = async (packID, dappies, amount) => {
    if (!collection) {
      alert(`
      You need to enable the collection first. 
      Go to the tab 'Collection' and click on 'Create Collection'.`)
      return
    }

    if(runningTxs) {
      alert("Previous transaction in process/nPlease wait...")
      return
    }

    var dappiesToMint = []

    for (let index = 0; index < dappies.length; index++) {
      if (index > 4) break
      const randomNumber = Math.floor(Math.random() * dappies.length);
      dappiesToMint.push(dappies[randomNumber])
    }

    let packNum = parseInt(packID.replace("Pack", ""))
    let res = await mutate({
      cadence: MINT_DAPPIES_FROM_PACK,
      limit: 300,
      args: (arg, t) => [arg(packNum, t.UInt32), arg(dappiesToMint, t.Array(t.UInt32)), arg(amount, t.UFix64)]
    })
    addTx(res)
    await tx(res).onceSealed
    await getFUSDBalance() 

    batchAddDappies(dappiesToMint)
  }

  return {
    ...state,
    fetchDappiesOfPack,
    fetchPackDetails,
    mintFromPack,
  }
}
