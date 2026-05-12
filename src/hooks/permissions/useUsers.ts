import { useState, useCallback } from 'react';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  assignPermissionsToUser,
} from '../../api/permissions/roles';
import type { User } from '../../types/permissions';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserById = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      return await getUserById(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addUser = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const newUser = await createUser(data);
      setUsers((prev) => [...prev, newUser]);
      return newUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const editUser = useCallback(async (id: number, data: any) => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await updateUser(id, data);
      setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeUser = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const assignPermissions = useCallback(async (userId: number, permissionIds: number[]) => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await assignPermissionsToUser(userId, permissionIds);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign permissions';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    fetchUserById,
    addUser,
    editUser,
    removeUser,
    assignPermissions,
  };
}
