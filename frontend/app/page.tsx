"use client"
import Loading from '@/components/loading'
import { Button } from '@/components/ui/button'
import { useAppData } from '@/context/AppContext'
import React from 'react'

const Home = () => {
  const {loading} = useAppData()
  return (
    <div>

      {loading ? <Loading/> : <Button>Click me</Button>}
    </div>
  )
}

export default Home