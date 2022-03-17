import { applyPatch } from 'fast-json-patch'

import { mutateObjectOnJsonPatch, throwOnInvalidJsonPatch } from '../config'
import { getDataByKey, setDataByKey } from '../services/dynamodb'
import status from '../utils/status'
import { AccountPreference, APIGatewayEvent, APIGatewayProxyResult, PatchOperation } from '../types'
import { extractJsonPatchFromEvent, getIdFromEvent } from '../utils/events'
import { log, logError } from '../utils/logging'

const applyJsonPatch = async (
  preference: AccountPreference,
  accountId: string,
  patchOperations: PatchOperation[]
): Promise<APIGatewayProxyResult> => {
  const updatedPreference = applyPatch(
    preference,
    patchOperations,
    throwOnInvalidJsonPatch,
    mutateObjectOnJsonPatch
  ).newDocument
  try {
    await setDataByKey(accountId, updatedPreference)
    return { ...status.OK, body: JSON.stringify(updatedPreference) }
  } catch (error) {
    logError(error)
    return status.INTERNAL_SERVER_ERROR
  }
}

const patchById = async (accountId: string, patchOperations: PatchOperation[]): Promise<APIGatewayProxyResult> => {
  try {
    const preference = await getDataByKey(accountId)
    try {
      return await applyJsonPatch(preference, accountId, patchOperations)
    } catch (error) {
      return { ...status.BAD_REQUEST, body: JSON.stringify({ message: error.message }) }
    }
  } catch {
    return status.NOT_FOUND
  }
}

export const patchItemHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  log('Received event', { ...event, body: undefined })
  try {
    const accountId = getIdFromEvent(event)
    const patchOperations = extractJsonPatchFromEvent(event)
    return await patchById(accountId, patchOperations)
  } catch (error) {
    return { ...status.BAD_REQUEST, body: JSON.stringify({ message: error.message }) }
  }
}
