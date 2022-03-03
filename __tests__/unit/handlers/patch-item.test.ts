import { mocked } from 'jest-mock'

import { key, jsonPatchOperations, preferences } from '../__mocks__'
import { patchItemHandler } from '@handlers/patch-item'
import eventJson from '@events/patch-item.json'
import * as dynamodb from '@services/dynamodb'
import { APIGatewayEvent, PatchOperation } from '@types'
import * as events from '@utils/events'
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
    mocked(events).extractJsonPatchFromEvent.mockReturnValue(jsonPatchOperations)
    mocked(events).getIdFromEvent.mockReturnValue(key)
  })

  describe('patchItemHandler', () => {
    test('expect BAD_REQUEST when invalid index', async () => {
      mocked(events).getIdFromEvent.mockImplementationOnce(() => {
        throw new Error('Bad request')
      })
      const result = await patchItemHandler(event)
      expect(result).toEqual(expect.objectContaining(status.BAD_REQUEST))
    })

    test('expect BAD_REQUEST when unable to parse body', async () => {
      mocked(events).extractJsonPatchFromEvent.mockImplementationOnce(() => {
        throw new Error('Bad request')
      })
      const result = await patchItemHandler(event)
      expect(result).toEqual(expect.objectContaining(status.BAD_REQUEST))
    })

    test('expect BAD_REQUEST when patch operations are invalid', async () => {
      mocked(events).extractJsonPatchFromEvent.mockReturnValueOnce([
        { op: 'replace', path: '/fnord' },
      ] as unknown[] as PatchOperation[])
      const result = await patchItemHandler(event)
      expect(result.statusCode).toEqual(status.BAD_REQUEST.statusCode)
    })

    test('expect INTERNAL_SERVER_ERROR on setDataByIndex reject', async () => {
      mocked(dynamodb).setDataByKey.mockRejectedValueOnce(undefined)
      const result = await patchItemHandler(event)
      expect(result).toEqual(expect.objectContaining(status.INTERNAL_SERVER_ERROR))
    })

    test('expect OK and body', async () => {
      const result = await patchItemHandler(event)
      expect(result).toEqual(expect.objectContaining({ ...status.OK, body: JSON.stringify(expectedResult) }))
    })
  })
})
