import { defaultDynamodbKey } from '../config'
import { getDataByKey } from '../services/dynamodb'
import { APIGatewayEvent, APIGatewayProxyResult } from '../types'
import { getIdFromEvent } from '../utils/events'
import { log } from '../utils/logging'
import status from '../utils/status'

type FetchErrorHandler = () => Promise<APIGatewayProxyResult>

const errorNotFound: FetchErrorHandler = (): Promise<APIGatewayProxyResult> => Promise.resolve(status.NOT_FOUND)

const fetchDefault: FetchErrorHandler = (): Promise<APIGatewayProxyResult> =>
  fetchById(defaultDynamodbKey, errorNotFound)

const fetchById = async (accountId: string, onError: FetchErrorHandler): Promise<APIGatewayProxyResult> => {
  try {
    const data = await getDataByKey(accountId)
    return { ...status.OK, body: JSON.stringify({ ...data, accountId }) }
  } catch {
    return await onError()
  }
}

export const getByIdHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  log('Received event', { ...event, body: undefined })
  try {
    const accountId = getIdFromEvent(event)
    return fetchById(accountId, fetchDefault)
  } catch (error) {
    return { ...status.BAD_REQUEST, body: JSON.stringify({ message: error.message }) }
  }
}
