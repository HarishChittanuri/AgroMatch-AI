import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const auth = {
    register: (data: any) => API.post('/auth/register', data),
    login: (formData: FormData) =>
        API.post('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
};

export const jobs = {
    create: (data: any) => API.post('/jobs/', data),
    getAll: () => API.get('/jobs/'),
    getById: (jobId: number) => API.get(`/jobs/${jobId}`),
    getMyJobs: () => API.get('/jobs/my-jobs'),
    deleteJob: (jobId: number) => API.delete(`/jobs/${jobId}`),
    searchByLocation: (q: string) => API.get(`/jobs/search?q=${encodeURIComponent(q)}`),
};

export const profiles = {
    createLabor: (data: any) => API.post('/profiles/labor', data),
    updateLabor: (data: any) => API.put('/profiles/labor', data),
    getMyProfile: () => API.get('/profiles/labor/me'),
};

export const matches = {
    getForLabor: () => API.get('/matches/for-labor'),
    getMyMatches: () => API.get('/matches/my-matches'),
};

export const applications = {
    // Apply to a job — sends JSON body matching ApplicationCreate schema
    apply: (jobId: number, matchScore: number = 0) =>
        API.post('/applications/', { job_id: jobId, match_score: matchScore }),

    // Get labor's own applications
    getMyApplications: () => API.get('/applications/my-applications'),

    // Get all applicants for a specific job (farmer only)
    getJobApplications: (jobId: number) => API.get(`/applications/job/${jobId}`),

    // Update application status — farmer only (accept / reject)
    updateStatus: (applicationId: number, status: string) =>
        API.patch(`/applications/${applicationId}/status`, { status }),

    // Labor withdraws their own pending application
    withdraw: (applicationId: number) =>
        API.delete(`/applications/${applicationId}`),
};

export const ai = {
    explainJob: (data: {
        title: string;
        description: string;
        wage: number;
        location?: string;
        duration?: string;
        workers_needed?: number;
        start_date?: string;
        language: string;
    }) => API.post('/ai/explain-job', data),

    chat: (data: {
        message: string;
        history?: { role: string; content: string }[];
    }) => API.post('/ai/chat', data),
};

export default API;