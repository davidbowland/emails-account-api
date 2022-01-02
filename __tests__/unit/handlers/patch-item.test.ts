import { mocked } from 'jest-mock'

import { key, jsonPatchOperations, preferences } from '../__mocks__'
import { patchItemHandler } from '@handlers/patch-item'
import eventJson from '@events/patch-item.json'
import * as dynamodb from '@services/dynamodb'
import { APIGatewayEvent } from '@types'
import * as events from '@utils/events'
import * as logging from '@utils/logging'
import status from '@utils/status'

jest.mock('@services/dynamodb')
jest.mock('@utils/events')
jest.mock('@utils/logging')

describe('patch-item', () => {
  const event = eventJson as unknown as APIGatewayEvent
  const expectedResult = { inbound: { save: true }, outbound: { ccTargets: ['another@email.address'], save: true } }

  beforeAll(() => {
    mocked(dynamodb).getDataByKey.mockResolvedValue(preferences)
    mocked(dynamodb).setDataByKey.mockResolvedValue(undefined)
    mocked(events).extractJsonPatchFromEvent.mockResolvedValue(jsonPatchOperations)
    mocked(events).getIdFromEvent.mockResolvedValue(key)
    mocked(logging).log.mockResolvedValue(undefined)
    mocked(logging).logErrorWithDefault.mockImplementation((value) => async () => value)
  })

  describe('patchItemHandler', () => {
    test('expect accountId passed to setDataByKey', async () => {
      await patchItemHandler(event)
      expect(mocked(dynamodb).setDataByKey).toHaveBeenCalledWith(key, expectedResult)
    })

    test('expect BAD_REQUEST when getIdFromEvent rejects', async () => {
      mocked(events).getIdFromEvent.mockRejectedValueOnce(undefined)
      const result = await patchItemHandler(event)
      expect(result).toEqual({ ...status.BAD_REQUEST, body: '{}' })
    })

    test('expect INTERNAL_SERVER_ERROR when getDataByKey rejects', async () => {
      mocked(dynamodb).getDataByKey.mockRejectedValueOnce(undefined)
      const result = await patchItemHandler(event)
      expect(result).toEqual(status.INTERNAL_SERVER_ERROR)
    })

    test('expect INTERNAL_SERVER_ERROR when setDataByKey rejects', async () => {
      mocked(dynamodb).setDataByKey.mockRejectedValueOnce(undefined)
      const result = await patchItemHandler(event)
      expect(result).toEqual(status.INTERNAL_SERVER_ERROR)
    })

    test('expect NO_CONTENT on success', async () => {
      const result = await patchItemHandler(event)
      expect(result).toEqual({ ...status.OK, body: JSON.stringify(expectedResult) })
    })
  })
})
