import { mocked } from 'jest-mock'

import { key, preferences } from '../__mocks__'
import { putItemHandler } from '@handlers/put-item'
import eventJson from '@events/put-item.json'
import * as dynamodb from '@services/dynamodb'
import { APIGatewayEvent } from '@types'
import * as events from '@utils/events'
import * as logging from '@utils/logging'
import status from '@utils/status'

jest.mock('@services/dynamodb')
jest.mock('@utils/events')
jest.mock('@utils/logging')

describe('put-item', () => {
  const event = eventJson as unknown as APIGatewayEvent

  beforeAll(() => {
    mocked(dynamodb).setDataByKey.mockResolvedValue(undefined)
    mocked(events).extractAccountPreferenceFromEvent.mockResolvedValue(preferences)
    mocked(events).getIdFromEvent.mockResolvedValue(key)
    mocked(logging).log.mockResolvedValue(undefined)
    mocked(logging).logErrorWithDefault.mockImplementation((value) => async () => value)
  })

  describe('putItemHandler', () => {
    test('expect accountId passed to setDataByKey', async () => {
      await putItemHandler(event)
      expect(mocked(dynamodb).setDataByKey).toHaveBeenCalledWith(key, preferences)
    })

    test('expect BAD_REQUEST when getIdFromEvent rejects', async () => {
      mocked(events).getIdFromEvent.mockRejectedValueOnce(undefined)
      const result = await putItemHandler(event)
      expect(result).toEqual({ ...status.BAD_REQUEST, body: '{}' })
    })

    test('expect INTERNAL_SERVER_ERROR when setDataByKey rejects', async () => {
      mocked(dynamodb).setDataByKey.mockRejectedValueOnce(undefined)
      const result = await putItemHandler(event)
      expect(result).toEqual(status.INTERNAL_SERVER_ERROR)
    })

    test('expect NO_CONTENT on success', async () => {
      const result = await putItemHandler(event)
      expect(result).toEqual(status.NO_CONTENT)
    })
  })
})
