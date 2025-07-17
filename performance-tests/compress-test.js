import { FormData } from "https://jslib.k6.io/formdata/0.0.2/index.js";
import { sleep } from "k6";
import http from "k6/http";

// Simple load test - ramping up to 50 users over 4 minutes
export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "30s", target: 20 },
    { duration: "30s", target: 30 },
    { duration: "30s", target: 40 },
    { duration: "2m", target: 50 },
  ],
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const TEST_FILE_URL =
  "https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_100KB_PDF.pdf";

let testFile;

export function setup() {
  const response = http.get(TEST_FILE_URL);
  if (response.status === 200) {
    testFile = { name: "test.pdf", data: response.body };
  }
  return { testFile };
}

export default function (data) {
  if (!data.testFile) return;

  const formData = new FormData();
  formData.append(
    "files",
    http.file(data.testFile.data, data.testFile.name, "application/pdf")
  );

  http.post(`${BASE_URL}/api/compress?format=tar.gz`, formData.body(), {
    headers: {
      "Content-Type": "multipart/form-data; boundary=" + formData.boundary,
    },
  });

  sleep(2);
}
