import { AccountPreference, PatchOperation } from '@types'

export const preferences: AccountPreference = {
  inbound: {
    forwardTargets: ['some@email.address'],
    save: true,
  },
  outbound: {
    ccTargets: ['another@email.address'],
    save: true,
  },
}

export const key = 'accountid'

export const jsonPatchOperations: PatchOperation[] = [{ op: 'replace', path: '/inbound', value: { save: true } }]
