import api from './api';

const ApiService = {
    // Auth endpoints
    async login(email: string, password: string) {

        try {
            const res = await api.post('/auth/login', { email, password });
            if (!res.ok) throw new Error('Login credentials invalid or refused');
            
            const data = await res.json();
            
            if (data?.accessToken) {
                localStorage.setItem('accessToken', data.accessToken);
            }
            return data;
        } catch (error) {
            throw error instanceof Error ? error.message : 'An unknown error occurred during login';
        }
    },

    async register(fullName: string, username: string, email: string, password: string) {
        
        try {
            const res = await api.post('/auth/register', {
                fullName,
                username,
                email,
                password,
            });
            if (!res.ok) throw new Error('Registration failed to create user criteria');
            return await res.json();
        } catch (error) {
            throw error instanceof Error ? error.message : 'An unknown error occurred during registration';
        }
    },

    async resendVerification(email: string) {
        try {
            const res = await api.post('/auth/resend-verification', { email });
            if (!res.ok) throw new Error('Failed to resend verification email');
            return await res.json();
        } catch (err) {
            console.error('Resend verification error:', err);
            throw err;
        }
    },

    async getCurrentUser() {
        try {
            const res = await api.get('/auth/me');
            if (!res.ok) throw new Error('Failed to fetch current user context session');
            return await res.json();
        } catch (error) {
            throw error instanceof Error ? error.message : 'An unknown error occurred matching profile context';
        }
    },

    async forgotPassword(email: string) {
        try {
            const res = await api.post('/auth/forgot-password', { email });
            if (!res.ok) throw new Error('Failed to send password reset email');
            return await res.json();
        } catch (error) {
            throw error instanceof Error ? error.message : 'An unknown error occurred processing password parameters';
        }
    },

    async resetPassword(token: string, newPassword: string) {
        try {
            const res = await api.post('/auth/reset-password', { token, newPassword });
            if (!res.ok) throw new Error('Failed to reset password');
            return await res.json();
        } catch (error) {
            throw error instanceof Error ? error.message : 'An unknown error occurred updating password architecture';
        }
    },

    async validUserName(query: string): Promise<{ valid: boolean }> {
        try {
            const res = await api.get(`/users/valid-username?query=${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error('Failed to validate username via infrastructure gateway');
            return await res.json();
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred checking system registry');
        }
    },

    async logout() {

        try {
            const res = await api.post('/auth/logout');
            if (!res.ok) throw new Error('Logout failed to invalidate session');
            localStorage.removeItem('accessToken');
            return await res.json();
        } catch (error) {
            throw error instanceof Error ? error.message : 'An unknown error occurred during logout process';
        }
    },

    // Users endpoints
    async searchUsers(query: string) {
        try {
            const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error("Failed to search users");
            return await res.json();
        } catch (error) {
            throw error instanceof Error ? error.message : "An unknown error occurred searching users";
        }
    },
    async getUserProfile(userId: string) {
        try {
            const res = await api.get(`/users/${userId}`);
            if (!res.ok) throw new Error('Failed to fetch user profile');
            return await res.json();
        } catch (error) {
            throw error instanceof Error ? error.message : 'An unknown error occurred fetching profile';
        }
    },

    async updateUserProfile(userId: string, data: any) {
        try {
            const { username, email, ...sanitizedPayload } = data;
            const res = await api.patch(`/users/${userId}`, sanitizedPayload);
            if (!res.ok) throw new Error('Failed to update user profile');
            return await res.json();
        } catch (error) {
            throw error instanceof Error ? error.message : 'An unknown error occurred updating profile';
        }
    },

    // Chat endpoints
    async listConversations() {
        try {
            const res = await api.get('/conversations');
            if (!res.ok) throw new Error('Failed to fetch conversations');
            return await res.json();
        } catch (error) {
            console.error('Error fetching conversations:', error);
            return [];
        }
    },

    async createConversation(participantId: string) {
        try {
            const res = await api.post('/conversations', { participantId });
            if (!res.ok) throw new Error('Failed to create conversation');
            return await res.json();
        } catch (error) {
            throw error instanceof Error ? error.message : 'An unknown error occurred creating conversation';
        }
    },

    async getMessages(conversationId: string) {
        try {
            const res = await api.get(`/conversations/${conversationId}/messages`);
            if (!res.ok) throw new Error('Failed to fetch messages');
            return await res.json();
        } catch (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
    },

    async sendMessage(conversationId: string, content: string) {
        try {
            const res = await api.post(`/conversations/${conversationId}/messages`, { content });
            if (!res.ok) throw new Error('Failed to send message');
            return await res.json();
        } catch (error) {
            throw error instanceof Error ? error.message : 'An unknown error occurred sending message';
        }
    },

    // Notifications endpoint
};

export default ApiService;
