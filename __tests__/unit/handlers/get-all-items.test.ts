import { mocked } from 'jest-mock'

import * as dynamodb from '@services/dynamodb'
import { key, preferences } from '../__mocks__'
import { APIGatewayEvent } from '@types'
import eventJson from '@events/get-all-items.json'
import { getAllItemsHandler } from '@handlers/get-all-items'
import status from '@utils/status'

jest.mock('@services/dynamodb')
jest.mock('@utils/events')
jest.mock('@utils/logging')

describe('get-all-items', () => {
  const event = eventJson as unknown as APIGatewayEvent

  beforeAll(() => {
    mocked(dynamodb).scanData.mockResolvedValue([{ data: preferences, id: key }])
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
        body: '[{"data":{"inbound":{"forwardTargets":["some@email.address"],"save":true},"outbound":{"ccTargets":["another@email.address"],"save":true}},"id":"accountid"}]',
        statusCode: 200,
      })
    })
  })
})
