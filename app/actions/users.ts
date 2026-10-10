// app/actions/users.ts
'use server';

import { prisma } from '@/lib/prisma';
import { ensureDatabaseInitialized } from '@/lib/dbInit';
import { User, UserRole } from '@/types';
import { revalidatePath } from 'next/cache';
import { broadcastEvent } from '@/lib/events';

export async function getUsersAction(): Promise<{ success: boolean; users?: User[]; error?: string }> {
  try {
    await ensureDatabaseInitialized();
    const dbUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' }
    });

    const users: User[] = dbUsers.map(u => ({
      id: u.id,
      name: u.name,
      role: (u.role as UserRole),
      email: u.email || undefined,
      avatar: u.avatar || undefined,
      active: u.active
    }));

    return { success: true, users };
  } catch (error: any) {
    console.error('[getUsersAction] Error:', error);
    return { success: false, error: error.message || 'Failed to fetch users' };
  }
}

export async function createUserAction(data: {
  name: string;
  role: UserRole;
  pin: string;
  email?: string;
  avatar?: string;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    await ensureDatabaseInitialized();

    if (!data.name || !data.name.trim()) {
      return { success: false, error: 'Staff name is required' };
    }

    if (!data.pin || data.pin.trim().length < 4) {
      return { success: false, error: 'PIN must be at least 4 digits' };
    }

    const validRole: UserRole =
      data.role === 'admin' ? 'admin' : data.role === 'manager' ? 'manager' : 'teller';

    const defaultAvatar =
      validRole === 'admin' ? '👑' : validRole === 'manager' ? '💼' : '🧑‍💼';

    const created = await prisma.user.create({
      data: {
        name: data.name.trim(),
        role: validRole,
        pin: data.pin.trim(),
        email: data.email?.trim() || null,
        avatar: data.avatar || defaultAvatar,
        active: true
      }
    });

    const user: User = {
      id: created.id,
      name: created.name,
      role: (created.role as UserRole),
      email: created.email || undefined,
      avatar: created.avatar || undefined,
      active: created.active
    };

    broadcastEvent('user:created', user);
    revalidatePath('/pos');
    revalidatePath('/');

    return { success: true, user };
  } catch (error: any) {
    console.error('[createUserAction] Error:', error);
    return { success: false, error: error.message || 'Failed to create staff member' };
  }
}

export async function updateUserAction(
  id: string,
  data: {
    name?: string;
    role?: UserRole;
    pin?: string;
    email?: string;
    avatar?: string;
    active?: boolean;
  }
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    await ensureDatabaseInitialized();

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: 'Staff member not found' };
    }

    // Safety check: ensure at least one active admin remains
    if (existing.role === 'admin' && (data.role && data.role !== 'admin' || data.active === false)) {
      const adminCount = await prisma.user.count({
        where: { role: 'admin', active: true, id: { not: id } }
      });
      if (adminCount === 0) {
        return { success: false, error: 'Cannot demote or deactivate the only remaining admin' };
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.role !== undefined ? { role: data.role } : {}),
        ...(data.pin !== undefined ? { pin: data.pin.trim() } : {}),
        ...(data.email !== undefined ? { email: data.email.trim() || null } : {}),
        ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
        ...(data.active !== undefined ? { active: data.active } : {})
      }
    });

    const user: User = {
      id: updated.id,
      name: updated.name,
      role: (updated.role as UserRole),
      email: updated.email || undefined,
      avatar: updated.avatar || undefined,
      active: updated.active
    };

    broadcastEvent('user:updated', user);
    revalidatePath('/pos');
    revalidatePath('/');

    return { success: true, user };
  } catch (error: any) {
    console.error('[updateUserAction] Error:', error);
    return { success: false, error: error.message || 'Failed to update staff member' };
  }
}

export async function deleteUserAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureDatabaseInitialized();

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: 'Staff member not found' };
    }

    if (existing.role === 'admin') {
      const otherAdmins = await prisma.user.count({
        where: { role: 'admin', id: { not: id } }
      });
      if (otherAdmins === 0) {
        return { success: false, error: 'Cannot delete the only admin staff member' };
      }
    }

    await prisma.user.delete({ where: { id } });

    broadcastEvent('user:deleted', { id });
    revalidatePath('/pos');
    revalidatePath('/');

    return { success: true };
  } catch (error: any) {
    console.error('[deleteUserAction] Error:', error);
    return { success: false, error: error.message || 'Failed to delete staff member' };
  }
}
