import { key, jsonPatchOperations, preferences } from '../__mocks__'
import getEventJson from '@events/get-by-id.json'
import patchEventJson from '@events/patch-item.json'
import putEventJson from '@events/put-item.json'
import { APIGatewayEvent } from '@types'
import { extractAccountPreferenceFromEvent, extractJsonPatchFromEvent, getIdFromEvent } from '@utils/events'

describe('events', () => {
  describe('extractAccountPreferenceFromEvent', () => {
    const event = putEventJson as unknown as APIGatewayEvent

    test('expect preference from event', () => {
      const result = extractAccountPreferenceFromEvent(event)
      expect(result).toEqual(preferences)
    })

    test('expect preference from event in base64', () => {
      const tempEvent = {
        ...event,
        body: Buffer.from(event.body).toString('base64'),
        isBase64Encoded: true,
      } as unknown as APIGatewayEvent
      const result = extractAccountPreferenceFromEvent(tempEvent)
      expect(result).toEqual(preferences)
    })

    test('expect preference when inbound missing', () => {
      const tempPreference = { ...preferences, inbound: undefined }
      const tempEvent = { ...event, body: JSON.stringify(tempPreference) } as unknown as APIGatewayEvent
      const result = extractAccountPreferenceFromEvent(tempEvent)
      expect(result).toEqual(tempPreference)
    })

    test('expect preference when outbound missing', () => {
      const tempPreference = { ...preferences, outbound: undefined }
      const tempEvent = { ...event, body: JSON.stringify(tempPreference) } as unknown as APIGatewayEvent
      const result = extractAccountPreferenceFromEvent(tempEvent)
      expect(result).toEqual(tempPreference)
    })

    test('expect reject on invalid event', () => {
      const tempEvent = { ...event, body: '{}' } as unknown as APIGatewayEvent
      expect(() => extractAccountPreferenceFromEvent(tempEvent)).toThrow()
    })
  })

  describe('extractJsonPatchFromEvent', () => {
    test('expect preference from event', () => {
      const result = extractJsonPatchFromEvent(patchEventJson as unknown as APIGatewayEvent)
      expect(result).toEqual(jsonPatchOperations)
    })
  })

  describe('getIdFromEvent', () => {
    test('expect ID from event', () => {
      const result = getIdFromEvent(getEventJson as unknown as APIGatewayEvent)
      expect(result).toEqual(key)
    })

    test('expect case-insensitive ID from event', () => {
      const result = getIdFromEvent({
        ...getEventJson,
        pathParameters: { accountId: getEventJson.pathParameters.accountId.toUpperCase() },
      } as unknown as APIGatewayEvent)
      expect(result).toEqual(key)
    })

    test('expect reject on invalid ID', () => {
      const tempEvent = {} as unknown as APIGatewayEvent
      expect(() => getIdFromEvent(tempEvent)).toThrow()
    })

    test('expect reject when pathParameter missing', () => {
      const tempEvent = { pathParameters: {} } as unknown as APIGatewayEvent
      expect(() => getIdFromEvent(tempEvent)).toThrow()
    })
  })
})
