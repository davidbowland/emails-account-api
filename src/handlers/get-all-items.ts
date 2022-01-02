import { scanData } from '../services/dynamodb'
import status from '../utils/status'
import { APIGatewayEvent, APIGatewayProxyResult } from '../types'
import { log, logErrorWithDefault } from '../utils/logging'

export const getAllItemsHandler = (event: APIGatewayEvent): Promise<APIGatewayProxyResult> =>
  log('Received event', event)
    .then(() => scanData().then((data) => ({ ...status.OK, body: JSON.stringify(data) })))
    .catch(logErrorWithDefault(status.INTERNAL_SERVER_ERROR))
