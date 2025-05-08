import fetchRetrier from "fetch-retry"

const MAX_RETRIES = 3
const NO_RETRY_ERROR_CODES = [400, 401, 403, 404, 405, 409, 422]
const BASE_RETRY_DELAY = process.env.NODE_ENV === "test" ? 10 : 1000

// This is a workaround to ensure retryingFetch uses MSW's fetch version in tests.
// See https://github.com/jonbern/fetch-retry/issues/95#issuecomment-2613990480
const fetch: typeof window.fetch = (...args) => window.fetch(...args)

/**
 * A wrapper around fetch that retries the request on certain error codes.
 *
 * By default:
 *
 * Requests will be retried if max retries not exceeded and :
 *  - The status code is >= 400 AND NOT in the NO_RETRY_ERROR_CODES list,
 *  - OR the request promise rejected (network error)
 *
 * The retry delay is exponential, 1s, 2s, 4s, 8s, ... maxing at 30s.
 *
 * Maximum retries is 3.
 *
 * NOTE:
 *  - When NODE_ENV="test", the maximum retries is set 0 by default but can be
 *  set via the TEST_ENV_MAX_RETRIES environment variable.
 */
const retryingFetch = fetchRetrier(fetch, {
  retryDelay: (attempt, _error, _response) => {
    return Math.min(BASE_RETRY_DELAY * 2 ** attempt, 30_000)
  },
  retryOn: (attempt, _error, response) => {
    if (attempt >= MAX_RETRIES) {
      return false
    }
    if (response) {
      if (response.status < 400) return false
      return !NO_RETRY_ERROR_CODES.includes(response.status)
    }
    return true
  },
})

export default retryingFetch
