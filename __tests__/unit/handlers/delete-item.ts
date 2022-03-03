import { mocked } from 'jest-mock'

import { key, preferences } from '../__mocks__'
import { deleteByIdHandler } from '@handlers/delete-item'
import eventJson from '@events/delete-item.json'
import * as dynamodb from '@services/dynamodb'
import { APIGatewayEvent } from '@types'
import * as events from '@utils/events'
import status from '@utils/status'

jest.mock('@services/dynamodb')
jest.mock('@utils/events')
jest.mock('@utils/logging')

describe('delete-item', () => {
  const event = eventJson as unknown as APIGatewayEvent

  beforeAll(() => {
    mocked(dynamodb).deleteDataByKey.mockResolvedValue(undefined)
    mocked(dynamodb).getDataByKey.mockResolvedValue(preferences)
    mocked(events).getIdFromEvent.mockReturnValue(key)
  })

  describe('deleteByIdHandler', () => {
    test('expect accountId passed to getDataByKey and deleteDataByKey', async () => {
      await deleteByIdHandler(event)
      expect(mocked(dynamodb).getDataByKey).toHaveBeenCalledWith(key)
      expect(mocked(dynamodb).deleteDataByKey).toHaveBeenCalledWith(key)
    })

    test('expect BAD_REQUEST when getIdFromEvent rejects', async () => {
      mocked(events).getIdFromEvent.mockImplementationOnce(() => {
        throw new Error('Bad request')
      })
      const result = await deleteByIdHandler(event)
      expect(result).toEqual(status.BAD_REQUEST)
    })

    test('expect NO_CONTENT when getDataByKey rejects', async () => {
      mocked(dynamodb).getDataByKey.mockRejectedValueOnce(undefined)
      const result = await deleteByIdHandler(event)
      expect(result).toEqual(status.NO_CONTENT)
    })

    test('expect INTERNAL_SERVER_ERROR when deleteDataByKey rejects', async () => {
      mocked(dynamodb).deleteDataByKey.mockRejectedValueOnce(undefined)
      const result = await deleteByIdHandler(event)
      expect(result).toEqual(status.INTERNAL_SERVER_ERROR)
    })

    test('expect preferences returned', async () => {
      const result = await deleteByIdHandler(event)
      expect(result).toEqual({
        body: '{"inbound":{"forwardTargets":["some@email.address"],"save":true},"outbound":{"ccTargets":["another@email.address"],"save":true}}',
        statusCode: 200,
      })
    })
  })
})
