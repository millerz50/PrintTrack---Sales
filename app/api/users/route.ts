import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureDatabaseInitialized } from '@/lib/dbInit';

export async function GET() {
  try {
    await ensureDatabaseInitialized();
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    const body = await req.json();
    const { name, role, pin, email, avatar } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'User name is required' },
        { status: 400 }
      );
    }

    if (!pin || pin.length < 4) {
      return NextResponse.json(
        { success: false, error: 'PIN must be at least 4 digits' },
        { status: 400 }
      );
    }

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        role: role === 'admin' ? 'admin' : 'teller',
        pin: pin.trim(),
        email: email ? email.trim() : null,
        avatar: avatar || (role === 'admin' ? '👑' : '🧑‍💼'),
        active: true
      }
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    const body = await req.json();
    const { id, name, role, pin, email, avatar, active } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Safety: If updating role from admin to teller or deactivating, verify there remains at least 1 active admin
    if (existing.role === 'admin' && (role === 'teller' || active === false)) {
      const adminCount = await prisma.user.count({
        where: { role: 'admin', active: true, id: { not: id } }
      });
      if (adminCount === 0) {
        return NextResponse.json(
          { success: false, error: 'Cannot demote or deactivate the only remaining admin' },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(role !== undefined ? { role: role === 'admin' ? 'admin' : 'teller' } : {}),
        ...(pin !== undefined ? { pin: pin.trim() } : {}),
        ...(email !== undefined ? { email: email.trim() || null } : {}),
        ...(avatar !== undefined ? { avatar } : {}),
        ...(active !== undefined ? { active: Boolean(active) } : {})
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role === 'admin') {
      const otherAdmins = await prisma.user.count({
        where: { role: 'admin', id: { not: id } }
      });
      if (otherAdmins === 0) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete the only admin user' },
          { status: 400 }
        );
      }
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
