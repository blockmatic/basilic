'use server'
import { cookies } from 'next/headers'
import { createAuth, type VerifyLoginPayloadParams } from 'thirdweb/auth'
import { privateKeyToAccount } from 'thirdweb/wallets'
import { client } from '@/lib/thirdweb'

const privateKey = process.env.AUTH_PRIVATE_KEY || ''

if (!privateKey) throw new Error('Missing AUTH_PRIVATE_KEY in .env file.')

const thirdwebAuth = createAuth({
  domain: process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN || '',
  adminAccount: privateKeyToAccount({ client, privateKey }),
  client: client,
})

export const generatePayload = thirdwebAuth.generatePayload

export async function login(payload: VerifyLoginPayloadParams) {
  const verifiedPayload = await thirdwebAuth.verifyPayload(payload)
  if (verifiedPayload.valid) {
    const jwt = await thirdwebAuth.generateJWT({
      payload: verifiedPayload.payload,
    })
    const cookieStore = await cookies()
    await cookieStore.set('jwt', jwt)

    // Track user addresses in our database for analytics and user engagement metrics
    // await upsertUserAddress({
    //   supabase: await createSupabaseServerClient(),
    //   address: verifiedPayload.payload.address,
    // })
  }
}

export async function isLoggedIn() {
  const cookieStore = await cookies()
  const jwt = await cookieStore.get('jwt')
  if (!jwt?.value) return false

  const authResult = await thirdwebAuth.verifyJWT({ jwt: jwt.value })
  return authResult.valid
}

export async function logout() {
  const cookieStore = await cookies()
  await cookieStore.delete('jwt')
}
