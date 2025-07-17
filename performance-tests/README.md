# Performance Tests for CC-App APIs

This directory contains [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) performance tests for the cc-app API endpoints using real PDF files from [freetestdata.com](https://freetestdata.com/document-files/pdf/).

## Test Files

- `api-performance.js` - test for both endpoints (hash and compress)
- `hash-test.js` - test for the hash endpoint
- `compress-test.js` - test for the compression endpoint

## Running Tests

```bash
# Run all test with a webview at port 5665
npm run perf:report

# Custom URL
BASE_URL=https://cc-app.mirzaesaaf.me npm run perf:report

# Run all tests against local server
npm run perf:all

# Run specific tests against local server
npm run perf:hash
npm run perf:compress
```
