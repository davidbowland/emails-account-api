import { getDataByKey } from '../services/dynamodb'
import { APIGatewayEvent, APIGatewayProxyResult } from '../types'
import { getIdFromEvent } from '../utils/events'
import { log, logErrorWithDefault } from '../utils/logging'
import status from '../utils/status'

export const getByIdHandler = (event: APIGatewayEvent): Promise<APIGatewayProxyResult> =>
  log('Received event', { ...event, body: undefined })
    .then(() => getIdFromEvent(event))
    .then((accountId) =>
      getDataByKey(accountId)
        .then((data) => ({ ...status.OK, body: JSON.stringify(data) }))
        .catch(logErrorWithDefault(status.INTERNAL_SERVER_ERROR))
    )
    .catch((err) => ({ ...status.BAD_REQUEST, body: JSON.stringify({ message: err }) }))
