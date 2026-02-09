import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'admin' | 'teacher' | 'parent'
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: 'admin' | 'teacher' | 'parent'
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    role: 'admin' | 'teacher' | 'parent'
  }
}
