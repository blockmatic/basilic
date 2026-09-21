import { localDev, vercelOidc } from 'eve/channels/auth'
import { eveChannel } from 'eve/channels/eve'
import { basilicAccessJwt } from './auth.js'
import { channelCors } from './cors.js'

export function createBasilicEveChannel() {
  return eveChannel({
    auth: [basilicAccessJwt(), vercelOidc(), localDev()],
    cors: channelCors(),
  })
}
