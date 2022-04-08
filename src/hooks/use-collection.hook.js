import { query } from '@onflow/fcl'
import { useState } from 'react'
import { useEffect } from 'react/cjs/react.production.min'

export default function useCollection() {
  const [loading, setLoading] = useState(true)
  const [collection, setCollection] = useState(false)

  useEffect(() => {
    if(!user?.addr)
      return

    const checkCollection = async () => {
      try{
        let res = await query({
          cadence: `
            import DappyContract from 0xDappy

            pub fun main(addr: Address): Bool {
              let ref = getAccount(addr).getCapability<&{DappyContract.CollectionPublic}>{/public/DappyCollection}
              return ref
            }
          `
        })
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    }
    checkCollection();
  }, [])

  const createCollection = async () => {
    setCollection(true)
  }

  const deleteCollection = async () => {
    setCollection(false)
    window.location.reload()
  }

  return {
    loading,
    collection,
    createCollection,
    deleteCollection
  }
}
