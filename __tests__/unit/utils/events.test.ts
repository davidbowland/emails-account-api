import { key, jsonPatchOperations, preferences } from '../__mocks__'
import getEventJson from '@events/get-by-id.json'
import patchEventJson from '@events/patch-item.json'
import putEventJson from '@events/put-item.json'
import { APIGatewayEvent } from '@types'
import { extractAccountPreferenceFromEvent, extractJsonPatchFromEvent, getIdFromEvent } from '@utils/events'

describe('events', () => {
  describe('extractAccountPreferenceFromEvent', () => {
    const event = putEventJson as unknown as APIGatewayEvent

    test('expect preference from event', async () => {
      const result = await extractAccountPreferenceFromEvent(event)
      expect(result).toEqual(preferences)
    })

    test('expect preference from event in base64', async () => {
      const tempEvent = {
        ...event,
        body: Buffer.from(event.body).toString('base64'),
        isBase64Encoded: true,
      } as unknown as APIGatewayEvent
      const result = await extractAccountPreferenceFromEvent(tempEvent)
      expect(result).toEqual(preferences)
    })

    test('expect preference when inbound missing', async () => {
      const tempPreference = { ...preferences, inbound: undefined }
      const tempEvent = { ...event, body: JSON.stringify(tempPreference) } as unknown as APIGatewayEvent
      const result = await extractAccountPreferenceFromEvent(tempEvent)
      expect(result).toEqual(tempPreference)
    })

    test('expect preference when outbound missing', async () => {
      const tempPreference = { ...preferences, outbound: undefined }
      const tempEvent = { ...event, body: JSON.stringify(tempPreference) } as unknown as APIGatewayEvent
      const result = await extractAccountPreferenceFromEvent(tempEvent)
      expect(result).toEqual(tempPreference)
    })

    test('expect reject on invalid event', async () => {
      const tempEvent = { ...event, body: '{}' } as unknown as APIGatewayEvent
      await expect(extractAccountPreferenceFromEvent(tempEvent)).rejects.toBeDefined()
    })
  })

  describe('extractJsonPatchFromEvent', () => {
    test('expect preference from event', async () => {
      const result = await extractJsonPatchFromEvent(patchEventJson as unknown as APIGatewayEvent)
      expect(result).toEqual(jsonPatchOperations)
    })
  })

  describe('getIdFromEvent', () => {
    test('expect ID from event', async () => {
      const result = await getIdFromEvent(getEventJson as unknown as APIGatewayEvent)
      expect(result).toEqual(key)
    })

    test('expect case-insensitive ID from event', async () => {
      const result = await getIdFromEvent({
        ...getEventJson,
        pathParameters: { accountId: getEventJson.pathParameters.accountId.toUpperCase() },
      } as unknown as APIGatewayEvent)
      expect(result).toEqual(key)
    })

    test('expect reject on invalid ID', async () => {
      const tempEvent = {} as unknown as APIGatewayEvent
      await expect(getIdFromEvent(tempEvent)).rejects.toBeDefined()
    })

    test('expect reject when pathParameter missing', async () => {
      const tempEvent = { pathParameters: {} } as unknown as APIGatewayEvent
      await expect(getIdFromEvent(tempEvent)).rejects.toBeDefined()
    })
  })
})
