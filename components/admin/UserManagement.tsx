import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '../../types.ts';
import { fetchUsers, updateUserRole, deleteUser } from '../../services/adminService.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import Spinner from '../Spinner.tsx';
import SubscriptionEditModal from './SubscriptionEditModal.tsx';

type SortKey = keyof User | 'subscription';

const UserManagement: React.FC = () => {
    const { user: adminUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    
    const [filterText, setFilterText] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });

    const loadUsers = useCallback(async () => {
        if (!adminUser?.token) return;
        setIsLoading(true);
        try {
            const allUsers = await fetchUsers(adminUser.token);
            setUsers(allUsers);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load users.');
        } finally {
            setIsLoading(false);
        }
    }, [adminUser?.token]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);
    
    const sortedAndFilteredUsers = useMemo(() => {
        let filtered = [...users];

        if (filterText) {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(filterText.toLowerCase()) ||
                user.email.toLowerCase().includes(filterText.toLowerCase())
            );
        }

        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                let aValue: string | undefined | null;
                let bValue: string | undefined | null;

                if (sortConfig.key === 'subscription') {
                    aValue = a.subscriptionStatus || 'free';
                    bValue = b.subscriptionStatus || 'free';
                } else {
                    aValue = a[sortConfig.key as keyof User] as string | undefined | null;
                    bValue = b[sortConfig.key as keyof User] as string | undefined | null;
                }
                
                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;
                
                if (aValue.toLowerCase() < bValue.toLowerCase()) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue.toLowerCase() > bValue.toLowerCase()) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filtered;
    }, [users, filterText, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: SortKey) => {
        if (!sortConfig || sortConfig.key !== key) return '↕';
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    };


    const handleRoleChange = async (userId: string, role: 'user' | 'admin') => {
        if (!adminUser?.token) return;
        try {
            await updateUserRole(userId, role, adminUser.token);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update user role.');
        }
    };

    const handleDelete = async (userId: string) => {
        if (!adminUser?.token || !window.confirm('Are you sure you want to delete this user? This is irreversible.')) return;
        try {
            await deleteUser(userId, adminUser.token);
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete user.');
        }
    };
    
    const SortableHeader: React.FC<{ sortKey: SortKey, children: React.ReactNode }> = ({ sortKey, children }) => (
        <th scope="col">
            <button onClick={() => requestSort(sortKey)} className="w-full flex items-center justify-start gap-2 group">
                {children}
                <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200">{getSortIndicator(sortKey)}</span>
            </button>
        </th>
    );
    
    if (isLoading) return <Spinner />;

    return (
        <div>
            {editingUser && (
                <SubscriptionEditModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSubscriptionUpdate={loadUsers}
                />
            )}
            <h2 className="text-xl font-bold mb-4">Manage Users ({users.length})</h2>
            {error && <p className="text-red-500 mb-4 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>}
            
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Filter by name or email..."
                    value={filterText}
                    onChange={e => setFilterText(e.target.value)}
                    className="form-input max-w-sm"
                />
            </div>

            <div className="overflow-x-auto card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <SortableHeader sortKey="name">Name</SortableHeader>
                            <SortableHeader sortKey="email">Email</SortableHeader>
                            <SortableHeader sortKey="role">Role</SortableHeader>
                            <SortableHeader sortKey="subscription">Subscription</SortableHeader>
                            <th scope="col" className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAndFilteredUsers.map(user => (
                            <tr key={user.id}>
                                <td className="font-medium text-gray-900 dark:text-white">{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value as 'user' | 'admin')}
                                        className="form-select p-2.5"
                                        disabled={user.id === adminUser?.id}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td>
                                    <span className={`badge capitalize ${user.subscriptionStatus === 'premium' ? 'badge-published' : user.subscriptionStatus === 'trial' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'}`}>
                                      {user.subscriptionStatus || 'Free'}
                                    </span>
                                    {user.subscriptionEndDate && <p className="text-xs mt-1">Ends: {new Date(user.subscriptionEndDate).toLocaleDateString()}</p>}
                                </td>
                                <td className="text-right font-medium space-x-2">
                                     <button 
                                        onClick={() => setEditingUser(user)}
                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        Manage
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(user.id)}
                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                                        disabled={user.id === adminUser?.id}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {sortedAndFilteredUsers.length === 0 && (
                    <p className="text-center py-8 text-gray-500 dark:text-gray-400">No users found matching your filter.</p>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
