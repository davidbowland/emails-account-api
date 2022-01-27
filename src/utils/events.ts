import { AccountPreference, APIGatewayEvent, PatchOperation } from '../types'

/* AccountPreferences */

const isValidPreference = (preference: AccountPreference): Promise<AccountPreference> =>
  Promise.resolve()
    .then(
      () =>
        preference.inbound ||
        preference.outbound ||
        Promise.reject('Either inbound or outbound options must be present')
    )
    .then(() => preference)

const formatPreference = (preference: AccountPreference): Promise<AccountPreference> =>
  isValidPreference(preference).then(() => ({
    inbound: preference.inbound
      ? { forwardTargets: preference.inbound.forwardTargets, save: preference.inbound.save }
      : undefined,
    outbound: preference.outbound
      ? { ccTargets: preference.outbound.ccTargets, save: preference.outbound.save }
      : undefined,
  }))

/* Event */

const parseEventBody = (event: APIGatewayEvent): Promise<unknown> =>
  Promise.resolve(
    JSON.parse(
      event.isBase64Encoded && event.body ? Buffer.from(event.body, 'base64').toString('utf8') : (event.body as string)
    )
  )

export const extractAccountPreferenceFromEvent = (event: APIGatewayEvent): Promise<AccountPreference> =>
  parseEventBody(event).then(formatPreference)

export const extractJsonPatchFromEvent = (event: APIGatewayEvent): Promise<PatchOperation[]> =>
  parseEventBody(event) as Promise<PatchOperation[]>

export const getIdFromEvent = (event: APIGatewayEvent): Promise<string> =>
  Promise.resolve(event.pathParameters?.accountId?.toLowerCase() ?? Promise.reject('Invalid account ID'))
