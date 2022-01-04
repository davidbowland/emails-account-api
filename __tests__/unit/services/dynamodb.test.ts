import { key, preferences } from '../__mocks__'
import { deleteDataByKey, getDataByKey, scanData, setDataByKey } from '@services/dynamodb'

const mockDeleteItem = jest.fn()
const mockGetItem = jest.fn()
const mockPutItem = jest.fn()
const mockScanTable = jest.fn()
jest.mock('aws-sdk', () => ({
  DynamoDB: jest.fn(() => ({
    deleteItem: (...args) => ({ promise: () => mockDeleteItem(...args) }),
    getItem: (...args) => ({ promise: () => mockGetItem(...args) }),
    putItem: (...args) => ({ promise: () => mockPutItem(...args) }),
    scan: (...args) => ({ promise: () => mockScanTable(...args) }),
  })),
}))

describe('dynamodb', () => {
  describe('deleteDataByKey', () => {
    test('expect key passed to delete', async () => {
      await deleteDataByKey(key)
      expect(mockDeleteItem).toHaveBeenCalledWith({
        Key: {
          Account: {
            S: key,
          },
        },
        TableName: 'account-table',
      })
    })
  })

  describe('getDataByKey', () => {
    beforeAll(() => {
      mockGetItem.mockResolvedValue({ Item: { Data: { S: JSON.stringify(preferences) } } })
    })

    test('expect key passed to get', async () => {
      await getDataByKey(key)
      expect(mockGetItem).toHaveBeenCalledWith({
        Key: {
          Account: {
            S: key,
          },
        },
        TableName: 'account-table',
      })
    })

    test('expect data parsed and returned', async () => {
      const result = await getDataByKey(key)
      expect(result).toEqual(preferences)
    })
  })

  describe('scanData', () => {
    beforeAll(() => {
      mockScanTable.mockResolvedValue({
        Items: [{ Account: { S: key }, Data: { S: JSON.stringify(preferences) } }],
      })
    })

    test('expect data parsed and returned', async () => {
      const result = await scanData()
      expect(result).toEqual({ [key]: preferences })
    })

    test('expect empty object with no data returned', async () => {
      mockScanTable.mockResolvedValueOnce({})
      const result = await scanData()
      expect(result).toEqual({})
    })
  })

  describe('setDataByKey', () => {
    test('expect key and data passed to put', async () => {
      await setDataByKey(key, preferences)
      expect(mockPutItem).toHaveBeenCalledWith({
        Item: {
          Account: {
            S: key,
          },
          Data: {
            S: JSON.stringify(preferences),
          },
        },
        TableName: 'account-table',
      })
    })
  })
})
