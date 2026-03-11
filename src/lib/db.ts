import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

// Lazy initialization via Proxy prevents build-time execution of new PrismaClient() on Vercel
export const prisma = new Proxy({} as PrismaClientSingleton, {
  get: (target, prop) => {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = prismaClientSingleton()
    }
    return Reflect.get(globalForPrisma.prisma, prop)
  }
})

if (process.env.NODE_ENV !== 'production') {
  // To avoid proxy assignment issues with hot reload, the target itself is manipulated inside the proxy
}
