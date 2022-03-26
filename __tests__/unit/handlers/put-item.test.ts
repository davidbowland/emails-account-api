import { mocked } from 'jest-mock'

import * as dynamodb from '@services/dynamodb'
import * as events from '@utils/events'
import { key, preferences } from '../__mocks__'
import { APIGatewayEvent } from '@types'
import eventJson from '@events/put-item.json'
import { putItemHandler } from '@handlers/put-item'
import status from '@utils/status'

jest.mock('@services/dynamodb')
jest.mock('@utils/events')
jest.mock('@utils/logging')

describe('put-item', () => {
  const event = eventJson as unknown as APIGatewayEvent

  beforeAll(() => {
    mocked(dynamodb).getDataByKey.mockResolvedValue(preferences)
    mocked(dynamodb).setDataByKey.mockResolvedValue(undefined)
    mocked(events).extractAccountPreferenceFromEvent.mockReturnValue(preferences)
    mocked(events).getIdFromEvent.mockReturnValue(key)
  })

  describe('putItemHandler', () => {
    test('expect accountId passed to setDataByKey', async () => {
      await putItemHandler(event)
      expect(mocked(dynamodb).setDataByKey).toHaveBeenCalledWith(key, preferences)
    })

    test('expect BAD_REQUEST when getIdFromEvent rejects', async () => {
      mocked(events).getIdFromEvent.mockImplementationOnce(() => {
        throw new Error('Bad request')
      })
      const result = await putItemHandler(event)
      expect(result).toEqual(status.BAD_REQUEST)
    })

    test('expect INTERNAL_SERVER_ERROR when setDataByKey rejects', async () => {
      mocked(dynamodb).setDataByKey.mockRejectedValueOnce(undefined)
      const result = await putItemHandler(event)
      expect(result).toEqual(status.INTERNAL_SERVER_ERROR)
    })

    test('expect OK on success when item already exists', async () => {
      const result = await putItemHandler(event)
      expect(result).toEqual({
        ...status.OK,
        body: '{"inbound":{"forwardTargets":["some@email.address"],"save":true},"outbound":{"ccTargets":["another@email.address"],"save":true}}',
      })
    })

    test('expect CREATED on success when item is new', async () => {
      mocked(dynamodb).getDataByKey.mockRejectedValueOnce(undefined)
      const result = await putItemHandler(event)
      expect(result).toEqual({
        ...status.CREATED,
        body: '{"inbound":{"forwardTargets":["some@email.address"],"save":true},"outbound":{"ccTargets":["another@email.address"],"save":true}}',
      })
    })
  })
})
