import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image } = body;

    if (!image || typeof image !== 'string' || !image.startsWith('data:image/png;base64,')) {
      return NextResponse.json(
        { error: 'Invalid image format. Expected PNG base64 data URL.' },
        { status: 400 }
      );
    }

    // Extract the raw base64 data bytes
    const base64Data = image.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate a unique 8-character ID for the sharing route
    const id = Math.random().toString(36).substring(2, 10);

    // Ensure the public/shares directory exists
    const sharesDir = path.join(process.cwd(), 'public', 'shares');
    if (!fs.existsSync(sharesDir)) {
      fs.mkdirSync(sharesDir, { recursive: true });
    }

    // Write the PNG image to disk
    const filePath = path.join(sharesDir, `${id}.png`);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ id });
  } catch (error) {
    console.error('API Share Error:', error);
    return NextResponse.json(
      { error: 'Failed to save generated card on the server.' },
      { status: 500 }
    );
  }
}
