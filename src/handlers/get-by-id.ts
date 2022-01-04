import { defaultDynamodbKey } from '../config'
import { getDataByKey } from '../services/dynamodb'
import { APIGatewayEvent, APIGatewayProxyResult } from '../types'
import { getIdFromEvent } from '../utils/events'
import { log, logErrorWithDefault } from '../utils/logging'
import status from '../utils/status'

type FetchErrorHandler = () => Promise<APIGatewayProxyResult>

const errorNotFound: FetchErrorHandler = (): Promise<APIGatewayProxyResult> => Promise.resolve(status.NOT_FOUND)

const fetchDefault: FetchErrorHandler = (): Promise<APIGatewayProxyResult> =>
  fetchById(defaultDynamodbKey, errorNotFound)

const fetchById = (accountId: string, onError: FetchErrorHandler): Promise<APIGatewayProxyResult> =>
  getDataByKey(accountId)
    .then((data) =>
      Promise.resolve({ ...status.OK, body: JSON.stringify({ ...data, accountId }) }).catch(
        logErrorWithDefault(status.INTERNAL_SERVER_ERROR)
      )
    )
    .catch(onError)

export const getByIdHandler = (event: APIGatewayEvent): Promise<APIGatewayProxyResult> =>
  log('Received event', { ...event, body: undefined })
    .then(() => getIdFromEvent(event))
    .then((accountId) => fetchById(accountId, fetchDefault))
    .catch((err) => ({ ...status.BAD_REQUEST, body: JSON.stringify({ message: err }) }))
