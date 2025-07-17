import { NextRequest } from 'next/server';
import archiver from 'archiver';
import { Readable } from 'stream';
import type { CompressionFormat } from '@/types';

export async function POST(request: NextRequest) {
  // Get the compression format from the query parameters
  const searchParams = request.nextUrl.searchParams;
  const format = (searchParams.get('format') || 'zip') as CompressionFormat;
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');
    
    if (!files.length) {
      return new Response('No files uploaded', { status: 400 });
    }

    // Set content type and extension based on format
    const contentType = format === 'zip' ? 'application/zip' : 'application/gzip';
    const extension = format === 'zip' ? 'zip' : 'tar.gz';
    
    // Create timestamp for unique archive name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `compressed-files-${timestamp}.${extension}`;

    // Create response headers
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);

    // Create a TransformStream for streaming the response
    const { readable, writable } = new TransformStream();

    // Create archiver stream with the selected format
    const archive = archiver(format === 'zip' ? 'zip' : 'tar', {
      gzip: format === 'tar.gz',
      gzipOptions: { level: 9, memLevel: 9 },
      zlib: { level: 9, memLevel: 9 }
    });
    
    const writableStream = writable.getWriter();

    // Pipe archive to the TransformStream
    archive.on('data', chunk => {
      writableStream.write(chunk);
    });

    archive.on('end', () => {
      writableStream.close();
    });

    archive.on('error', (err) => {
      console.error('Archive error:', err);
      writableStream.abort(err);
    });

    // Process all files
    for (const file of files) {
      const fileInstance = file as File;
      const bytes = await fileInstance.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const readStream = Readable.from(buffer);
      archive.append(readStream, { name: fileInstance.name });
    }

    // Start the archiving process
    archive.finalize();

    // Return the streaming response
    return new Response(readable, { headers });
  } catch (error) {
    console.error('Error processing file:', error);
    return new Response('Error processing file', { status: 500 });
  }
}
