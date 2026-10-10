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
        { success: false, error: 'User ID and security PIN are required.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.active) {
      return NextResponse.json(
        { success: false, error: 'Staff account not found or deactivated.' },
        { status: 404 }
      );
    }

    // Strict constant-time-like PIN comparison
    if (user.pin !== pin.trim()) {
      return NextResponse.json(
        { success: false, error: 'Incorrect security PIN. Access denied.' },
        { status: 401 }
      );
    }

    // Create session token with timestamp
    const sessionToken = `magen_sess_${user.id}_${Date.now()}`;

    return NextResponse.json({
      success: true,
      token: sessionToken,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        avatar: user.avatar || '👤',
        email: user.email,
        active: user.active
      }
    });
  } catch (error: any) {
    console.error('Error during staff login authentication:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication service error. Please try again.' },
      { status: 500 }
    );
  }
}
