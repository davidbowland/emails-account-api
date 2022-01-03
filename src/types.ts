export * from 'aws-lambda'
export { Operation as PatchOperation } from 'fast-json-patch'

export interface AccountInboundPreference {
  forwardTargets?: string[]
  save: boolean
}

export interface AccountOutboundPreference {
  ccTargets?: string[]
  save: boolean
}

export interface AccountPreference {
  inbound?: AccountInboundPreference
  outbound?: AccountOutboundPreference
}

export interface Accounts {
  [key: string]: AccountPreference
}
