import { beforeEach, vi } from "vitest"

type ChromeStorageRecord = Record<string, unknown>

export const mockStorage: ChromeStorageRecord = {}

export const chromeMock = {
  storage: {
    local: {
      get: vi.fn(
        async (key: string): Promise<ChromeStorageRecord> => ({
          [key]: mockStorage[key]
        })
      ),
      set: vi.fn(async (payload: ChromeStorageRecord): Promise<void> => {
        Object.assign(mockStorage, payload)
      })
    }
  }
}
;(globalThis as typeof globalThis & { chrome: typeof chromeMock }).chrome =
  chromeMock

beforeEach(() => {
  vi.clearAllMocks()
  for (const key of Object.keys(mockStorage)) {
    delete mockStorage[key]
  }
})
