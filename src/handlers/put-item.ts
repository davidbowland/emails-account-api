import { APIGatewayEvent, APIGatewayProxyResult, AccountPreference } from '../types'
import { extractAccountPreferenceFromEvent, getIdFromEvent } from '../utils/events'
import { getDataByKey, setDataByKey } from '../services/dynamodb'
import { log, logError } from '../utils/logging'
import status from '../utils/status'

const getResponse = async (accountId: string): Promise<{ statusCode: number }> => {
  try {
    await getDataByKey(accountId)
    return status.OK
  } catch {
    return status.CREATED
  }
}

const setPreferenceById = async (accountId: string, preference: AccountPreference): Promise<APIGatewayProxyResult> => {
  try {
    const response = await getResponse(accountId)
    await setDataByKey(accountId, preference)
    return { ...response, body: JSON.stringify(preference) }
  } catch (error) {
    logError(error)
    return status.INTERNAL_SERVER_ERROR
  }
}

export const putItemHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  log('Received event', { ...event, body: undefined })
  try {
    const accountId = getIdFromEvent(event)
    const preference = extractAccountPreferenceFromEvent(event)
    return await setPreferenceById(accountId, preference)
  } catch (error) {
    return { ...status.BAD_REQUEST, body: JSON.stringify({ message: error.message }) }
  }
}
