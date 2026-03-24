'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/app'
import type { User } from '@/types'

interface Props {
  user: User
}

export default function UserInitializer({ user }: Props) {
  const setUser = useAppStore((s) => s.setUser)

  useEffect(() => {
    setUser(user)
  }, [user, setUser])

  return null
}
