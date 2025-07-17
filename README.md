# File Processing Demo App with HPA

This is a Next.js application that can be used to demonstrates Horizontal Pod Autoscaling (HPA) in Kubernetes. The application provides a simple UI for uploading files, which are then hashed and compressed. The processing is designed to create CPU load that can trigger the HPA.

## Features

- File upload with drag-and-drop support
- SHA-256 file hashing
- File compression
- Display of file statistics
- Horizontal Pod Autoscaling based on CPU and memory usage

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.
