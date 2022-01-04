import { getDataByKey, setDataByKey } from '../services/dynamodb'
import status from '../utils/status'
import { AccountPreference, APIGatewayEvent, APIGatewayProxyResult } from '../types'
import { extractAccountPreferenceFromEvent, getIdFromEvent } from '../utils/events'
import { log, logErrorWithDefault } from '../utils/logging'

const getResponse = (accountId: string, preferences: AccountPreference): Promise<APIGatewayProxyResult> =>
  getDataByKey(accountId)
    .then(() => status.OK)
    .catch(() => status.CREATED)
    .then((response) => ({ ...response, body: JSON.stringify(preferences) }))

const setPreferenceById = (accountId: string, preference: AccountPreference): Promise<APIGatewayProxyResult> =>
  getResponse(accountId, preference).then((response) =>
    setDataByKey(accountId, preference)
      .then(() => response)
      .catch(logErrorWithDefault(status.INTERNAL_SERVER_ERROR))
  )

export const putItemHandler = (event: APIGatewayEvent): Promise<APIGatewayProxyResult> =>
  log('Received event', { ...event, body: undefined })
    .then(() =>
      getIdFromEvent(event).then((accountId) =>
        extractAccountPreferenceFromEvent(event).then((preference) => setPreferenceById(accountId, preference))
      )
    )
    .catch((err) => ({ ...status.BAD_REQUEST, body: JSON.stringify({ message: err }) }))
