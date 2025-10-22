import 'next-auth'

declare module 'next-auth' {
  interface User {
    role: 'ADMIN' | 'PARTICIPANT'
  }

  interface Session {
    user: {
      id: string
      name: string
      role: 'ADMIN' | 'PARTICIPANT'
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'ADMIN' | 'PARTICIPANT'
  }
}
