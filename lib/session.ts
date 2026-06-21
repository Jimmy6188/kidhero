"use client"

interface KidSession {
  id: string
  name: string
  role: "kid"
  parent_id?: string
  avatar?: string
  grade?: number
}

interface KidInfo {
  id: string
  name: string
  avatar: string
}

interface ParentSession {
  id: string
  name: string
  role: "parent"
  kid_id?: string
  kids?: KidInfo[]
}

export function getKidSession(): KidSession | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem("kid_user")
  if (!raw) return null

  try {
    return JSON.parse(raw) as KidSession
  } catch {
    return null
  }
}

export function setKidSession(session: KidSession) {
  localStorage.setItem("kid_user", JSON.stringify(session))
}

export function getParentSession(): ParentSession | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem("parent_user")
  if (!raw) return null

  try {
    return JSON.parse(raw) as ParentSession
  } catch {
    return null
  }
}

export function setParentSession(session: ParentSession) {
  localStorage.setItem("parent_user", JSON.stringify(session))
}

export function switchKid(kidId: string): boolean {
  const parent = getParentSession()
  if (!parent) {
    console.warn("switchKid: No parent session found")
    return false
  }

  const kid = parent.kids?.find((k) => k.id === kidId)
  if (!kid) {
    console.warn(`switchKid: Kid with id ${kidId} not found`)
    return false
  }

  setParentSession({ ...parent, kid_id: kidId })
  setKidSession({
    id: kid.id,
    name: kid.name,
    role: "kid",
    parent_id: parent.id,
    avatar: kid.avatar,
  })
  return true
}

export function getActiveKidId(): string {
  const parent = getParentSession()
  if (parent?.kid_id) return parent.kid_id

  const kid = getKidSession()
  if (kid?.id) return kid.id

  return ""
}

export function clearSession() {
  localStorage.removeItem("kid_user")
  localStorage.removeItem("parent_user")
}
