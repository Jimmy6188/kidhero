"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getKidSession, getParentSession, setKidSession, setParentSession } from "@/lib/session"

const DEFAULT_KID_ID = "00000000-0000-0000-0000-00000000b001"
const DEFAULT_PARENT_ID = "00000000-0000-0000-0000-00000000a001"

export default function KidPageClient() {
  const router = useRouter()

  useEffect(() => {
    const bootstrapKidSession = async () => {
      const existingKid = getKidSession()
      if (existingKid?.id) {
        router.replace("/kid/home")
        return
      }

      const parent = getParentSession()

      if (parent?.id) {
        let kidId = parent.kid_id

        if (!kidId) {
          const kidsRes = await fetch(`/api/kids?parent_id=${parent.id}`)
          const kidsData = await kidsRes.json()
          const firstKid = (kidsData.kids || [])[0]

          if (!firstKid?.id) {
            router.replace("/parent/create-kid")
            return
          }

          kidId = firstKid.id
          setParentSession({ ...parent, kid_id: kidId })
          setKidSession({
            id: firstKid.id,
            name: firstKid.name,
            role: "kid",
            parent_id: parent.id,
          })
          router.replace("/kid/home")
          return
        }

        setKidSession({
          id: kidId,
          name: "小超人",
          role: "kid",
          parent_id: parent.id,
        })
        router.replace("/kid/home")
        return
      }

      // No parent session — kid entered directly, use default test account
      setKidSession({
        id: DEFAULT_KID_ID,
        name: "小超人",
        role: "kid",
        parent_id: DEFAULT_PARENT_ID,
      })
      router.replace("/kid/home")
    }

    bootstrapKidSession()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      正在进入孩子主页...
    </div>
  )
}
