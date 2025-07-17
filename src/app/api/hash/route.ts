import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { HashResponse, HashResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');
    
    if (!files.length) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const results = await Promise.all(files.map(async (file) => {
      const fileInstance = file as File;
      const bytes = await fileInstance.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const hash = crypto.createHash('sha256').update(buffer).digest('hex');

      return {
        originalName: fileInstance.name,
        hash: hash,
        size: buffer.length
      } as HashResult;
    }));

    return NextResponse.json(results) as NextResponse<HashResponse>;
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ error: 'Error processing file' }, { status: 500 });
  }
}
