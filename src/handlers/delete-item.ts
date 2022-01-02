import { deleteDataByKey, getDataByKey } from '../services/dynamodb'
import { APIGatewayEvent, APIGatewayProxyResult } from '../types'
import { getIdFromEvent } from '../utils/events'
import { log, logErrorWithDefault } from '../utils/logging'
import status from '../utils/status'

const fetchDataThenDelete = (accountId: string): Promise<APIGatewayProxyResult> =>
  getDataByKey(accountId)
    .then((data) =>
      deleteDataByKey(accountId)
        .then(() => ({ ...status.OK, body: JSON.stringify(data) }))
        .catch(logErrorWithDefault(status.INTERNAL_SERVER_ERROR))
    )
    .catch(logErrorWithDefault(status.NO_CONTENT))

export const deleteByIdHandler = (event: APIGatewayEvent): Promise<APIGatewayProxyResult> =>
  log('Received event', { ...event, body: undefined })
    .then(() => getIdFromEvent(event).then(fetchDataThenDelete))
    .catch((err) => ({ ...status.BAD_REQUEST, body: JSON.stringify({ message: err }) }))
