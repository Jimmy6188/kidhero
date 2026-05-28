"use client"

interface KidSession {
  id: string
  name: string
  role: "kid"
  parent_id?: string
}

interface ParentSession {
  id: string
  name: string
  role: "parent"
  kid_id?: string
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

export function getActiveKidId(): string {
  const parent = getParentSession()
  if (parent?.kid_id) return parent.kid_id

  const kid = getKidSession()
  if (kid?.id) return kid.id

  return ""
}
