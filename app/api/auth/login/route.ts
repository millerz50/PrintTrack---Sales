import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureDatabaseInitialized } from '@/lib/dbInit';

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    const body = await req.json();
    const { userId, pin } = body;

    if (!userId || !pin) {
      return NextResponse.json(
        { success: false, error: 'User ID and PIN are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.pin !== pin.trim()) {
      return NextResponse.json(
        { success: false, error: 'Invalid PIN. Please try again.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        pin: user.pin,
        avatar: user.avatar || '👤',
        email: user.email
      }
    });
  } catch (error: any) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
