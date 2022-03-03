import { mocked } from 'jest-mock'

import { key, preferences } from '../__mocks__'
import { getByIdHandler } from '@handlers/get-by-id'
import eventJson from '@events/get-by-id.json'
import * as dynamodb from '@services/dynamodb'
import { APIGatewayEvent } from '@types'
import * as events from '@utils/events'
import status from '@utils/status'

jest.mock('@services/dynamodb')
jest.mock('@utils/events')
jest.mock('@utils/logging')

describe('get-by-id', () => {
  const event = eventJson as unknown as APIGatewayEvent

  beforeAll(() => {
    mocked(dynamodb).getDataByKey.mockResolvedValue(preferences)
    mocked(events).getIdFromEvent.mockReturnValue(key)
  })

  describe('getByIdHandler', () => {
    test('expect accountId passed to getDataByKey', async () => {
      await getByIdHandler(event)
      expect(mocked(dynamodb).getDataByKey).toHaveBeenCalledWith(key)
    })

    test('expect BAD_REQUEST when getIdFromEvent rejects', async () => {
      mocked(events).getIdFromEvent.mockImplementationOnce(() => {
        throw new Error('Bad request')
      })
      const result = await getByIdHandler(event)
      expect(result).toEqual(status.BAD_REQUEST)
    })

    test('expect default value when getDataByKey rejects once', async () => {
      mocked(dynamodb).getDataByKey.mockRejectedValueOnce(undefined)
      const result = await getByIdHandler(event)
      expect(result).toEqual({
        body: '{"inbound":{"forwardTargets":["some@email.address"],"save":true},"outbound":{"ccTargets":["another@email.address"],"save":true},"accountId":"default"}',
        statusCode: 200,
      })
    })

    test('expect NOT_FOUND when getDataByKey rejects', async () => {
      mocked(dynamodb).getDataByKey.mockRejectedValueOnce(undefined)
      mocked(dynamodb).getDataByKey.mockRejectedValueOnce(undefined)
      const result = await getByIdHandler(event)
      expect(result).toEqual(status.NOT_FOUND)
    })

    test('expect preferences returned', async () => {
      const result = await getByIdHandler(event)
      expect(result).toEqual({
        body: '{"inbound":{"forwardTargets":["some@email.address"],"save":true},"outbound":{"ccTargets":["another@email.address"],"save":true},"accountId":"accountid"}',
        statusCode: 200,
      })
    })
  })
})
