import { AccountPreference, APIGatewayEvent, PatchOperation } from '../types'

/* AccountPreferences */

const formatPreference = (preference: AccountPreference): AccountPreference => {
  if (!preference.inbound && !preference.outbound) {
    throw new Error('Either inbound or outbound options must be present')
  }
  return {
    inbound: preference.inbound
      ? { forwardTargets: preference.inbound.forwardTargets, save: preference.inbound.save }
      : undefined,
    outbound: preference.outbound
      ? { ccTargets: preference.outbound.ccTargets, save: preference.outbound.save }
      : undefined,
  }
}

/* Event */

const parseEventBody = (event: APIGatewayEvent): unknown =>
  JSON.parse(
    event.isBase64Encoded && event.body ? Buffer.from(event.body, 'base64').toString('utf8') : (event.body as string)
  )

export const extractAccountPreferenceFromEvent = (event: APIGatewayEvent): AccountPreference =>
  formatPreference(parseEventBody(event))

export const extractJsonPatchFromEvent = (event: APIGatewayEvent): PatchOperation[] =>
  parseEventBody(event) as PatchOperation[]

export const getIdFromEvent = (event: APIGatewayEvent): string => {
  const accountId = event.pathParameters?.accountId?.toLowerCase()
  if (!accountId) {
    throw new Error('Invalid account ID')
  }
  return accountId
}
