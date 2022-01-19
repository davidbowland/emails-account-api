import { deleteDataByKey, getDataByKey } from '../services/dynamodb'
import { APIGatewayEvent, APIGatewayProxyResult } from '../types'
import { getIdFromEvent } from '../utils/events'
import { log, logError } from '../utils/logging'
import status from '../utils/status'

const deleteData = async (accountId: string, data: any): Promise<APIGatewayProxyResult> => {
  try {
    await deleteDataByKey(accountId)
    return { ...status.OK, body: JSON.stringify(data) }
  } catch (error) {
    logError(error)
    return status.INTERNAL_SERVER_ERROR
  }
}

const fetchDataThenDelete = async (accountId: string): Promise<APIGatewayProxyResult> => {
  try {
    const data = await getDataByKey(accountId)
    return deleteData(accountId, data)
  } catch {
    return status.NO_CONTENT
  }
}

export const deleteByIdHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  log('Received event', { ...event, body: undefined })
  try {
    const accountId = await getIdFromEvent(event)
    return await fetchDataThenDelete(accountId)
  } catch (error) {
    return { ...status.BAD_REQUEST, body: JSON.stringify({ message: error }) }
  }
}
