import { applyPatch } from 'fast-json-patch'

import { mutateObjectOnJsonPatch, throwOnInvalidJsonPatch } from '../config'
import { getDataByKey, setDataByKey } from '../services/dynamodb'
import status from '../utils/status'
import { AccountPreference, APIGatewayEvent, APIGatewayProxyResult, PatchOperation } from '../types'
import { extractJsonPatchFromEvent, getIdFromEvent } from '../utils/events'
import { log, logErrorWithDefault } from '../utils/logging'

const performPatch = (preference: AccountPreference, patchOperations: PatchOperation[]): Promise<AccountPreference> =>
  Promise.resolve().then(
    () => applyPatch(preference, patchOperations, throwOnInvalidJsonPatch, mutateObjectOnJsonPatch).newDocument
  )

const patchPreferenceById = (accountId: string, patchOperations: PatchOperation[]): Promise<APIGatewayProxyResult> =>
  getDataByKey(accountId)
    .then((preference: AccountPreference) =>
      performPatch(preference, patchOperations)
        .then((updatedPreference: AccountPreference) =>
          setDataByKey(accountId, updatedPreference)
            .then(() => ({ ...status.OK, body: JSON.stringify(updatedPreference) }))
            .catch(logErrorWithDefault(status.INTERNAL_SERVER_ERROR))
        )
        .catch((err) => ({ ...status.BAD_REQUEST, body: JSON.stringify({ message: err }) }))
    )
    .catch(logErrorWithDefault(status.INTERNAL_SERVER_ERROR))

export const patchItemHandler = (event: APIGatewayEvent): Promise<APIGatewayProxyResult> =>
  log('Received event', { ...event, body: undefined })
    .then(() =>
      getIdFromEvent(event).then((accountId) =>
        extractJsonPatchFromEvent(event).then((patchOperations) =>
          patchPreferenceById(accountId, patchOperations).catch(logErrorWithDefault(status.INTERNAL_SERVER_ERROR))
        )
      )
    )
    .catch((err) => ({ ...status.BAD_REQUEST, body: JSON.stringify({ message: err }) }))
