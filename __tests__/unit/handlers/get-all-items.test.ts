import { mocked } from 'jest-mock'

import { key, preferences } from '../__mocks__'
import { getAllItemsHandler } from '@handlers/get-all-items'
import eventJson from '@events/get-all-items.json'
import * as dynamodb from '@services/dynamodb'
import { APIGatewayEvent } from '@types'
import * as events from '@utils/events'
import status from '@utils/status'

jest.mock('@services/dynamodb')
jest.mock('@utils/events')
jest.mock('@utils/logging')

describe('get-all-items', () => {
  const event = eventJson as unknown as APIGatewayEvent

  beforeAll(() => {
    mocked(dynamodb).scanData.mockResolvedValue({ [key]: preferences })
    mocked(events).getIdFromEvent.mockResolvedValue(key)
  })

  describe('getAllItemsHandler', () => {
    test('expect INTERNAL_SERVER_ERROR when scanData rejects', async () => {
      mocked(dynamodb).scanData.mockRejectedValueOnce(undefined)
      const result = await getAllItemsHandler(event)
      expect(result).toEqual(status.INTERNAL_SERVER_ERROR)
    })

    test('expect preferences returned', async () => {
      const result = await getAllItemsHandler(event)
      expect(result).toEqual({
        body: '{"accountid":{"inbound":{"forwardTargets":["some@email.address"],"save":true},"outbound":{"ccTargets":["another@email.address"],"save":true}}}',
        statusCode: 200,
      })
    })
  })
})
