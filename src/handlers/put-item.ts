import { setDataByKey } from '../services/dynamodb'
import status from '../utils/status'
import { AccountPreference, APIGatewayEvent, APIGatewayProxyResult } from '../types'
import { extractAccountPreferenceFromEvent, getIdFromEvent } from '../utils/events'
import { log, logErrorWithDefault } from '../utils/logging'

const setPreferenceById = (accountId: string, preference: AccountPreference): Promise<APIGatewayProxyResult> =>
  setDataByKey(accountId, preference)
    .then(() => status.NO_CONTENT)
    .catch(logErrorWithDefault(status.INTERNAL_SERVER_ERROR))

export const putItemHandler = (event: APIGatewayEvent): Promise<APIGatewayProxyResult> =>
  log('Received event', { ...event, body: undefined })
    .then(() =>
      getIdFromEvent(event).then((accountId) =>
        extractAccountPreferenceFromEvent(event).then((preference) => setPreferenceById(accountId, preference))
      )
    )
    .catch((err) => ({ ...status.BAD_REQUEST, body: JSON.stringify({ message: err }) }))
