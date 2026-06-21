import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { createProject, updateProject } from '../api/projectService';
import { getClients } from '../../clients/api/clientService';
import { getEmployees } from '../../employees/api/employeeService';
import type { Project } from '../types/project';
import type { Client } from '../../clients/types/client';
import type { Employee } from '../../employees/types/employee';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project?: Project | null;
}

export default function ProjectModal({ isOpen, onClose, onSuccess, project }: ProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: '',
    status: 'Planning',
    priority: 'Medium',
    startDate: new Date().toISOString().split('T')[0],
    deadline: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
    teamMembers: [] as string[],
  });

  useEffect(() => {
    if (!isOpen) return;

    // Fetch clients and employees for dropdowns
    const fetchData = async () => {
      try {
        const [clientsRes, employeesRes] = await Promise.all([
          getClients(1, 100, ''),
          getEmployees(1, 100, '')
        ]);
        if (clientsRes.success && Array.isArray(clientsRes.data)) setClients(clientsRes.data);
        if (employeesRes.success && Array.isArray(employeesRes.data)) setEmployees(employeesRes.data);
      } catch (err) {
        console.error('Failed to fetch dependencies', err);
      }
    };
    fetchData();

    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        clientId: project.clientId?._id || '',
        status: project.status,
        priority: project.priority,
        startDate: new Date(project.startDate).toISOString().split('T')[0],
        deadline: new Date(project.deadline).toISOString().split('T')[0],
        teamMembers: project.teamMembers?.map(m => m._id) || [],
      });
    } else {
      setFormData({
        name: '',
        description: '',
        clientId: '',
        status: 'Planning',
        priority: 'Medium',
        startDate: new Date().toISOString().split('T')[0],
        deadline: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
        teamMembers: [],
      });
    }
    setError(null);
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Filter out empty clientId if left empty
    const payload = {
      ...formData,
      clientId: formData.clientId || null,
    };

    try {
      if (project) {
        await updateProject(project._id, payload);
      } else {
        await createProject(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError((err as any).response?.data?.error?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const toggleTeamMember = (empId: string) => {
    setFormData(prev => {
      const isSelected = prev.teamMembers.includes(empId);
      if (isSelected) {
        return { ...prev, teamMembers: prev.teamMembers.filter(id => id !== empId) };
      } else {
        return { ...prev, teamMembers: [...prev.teamMembers, empId] };
      }
    });
  };

  const inputClass = "w-full h-10 px-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50 disabled:hover:bg-muted/30";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm fade-in p-4">
      <div className="bg-background w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">{project ? 'Edit Project' : 'Create New Project'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-danger/10 text-danger text-sm font-medium rounded-xl border border-danger/20">
              {error}
            </div>
          )}

          <form id="project-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Project Name *</label>
              <input
                required
                type="text"
                className={inputClass}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea
                rows={3}
                className="w-full p-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Client</label>
                <select
                  className={inputClass}
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                >
                  <option value="">Internal Project (No Client)</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>{client.companyName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Priority</label>
                <select
                  className={inputClass}
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Start Date *</label>
                <input
                  required
                  type="date"
                  className={inputClass}
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Deadline *</label>
                <input
                  required
                  type="date"
                  className={inputClass}
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Status</label>
              <select
                className={inputClass}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium text-foreground">Team Members</label>
              <div className="max-h-40 overflow-y-auto rounded-xl border border-border/50 bg-muted/30 p-2 space-y-1">
                {employees.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-2 text-center">No employees found.</p>
                ) : (
                  employees.map(emp => (
                    <label key={emp._id} className="flex items-center gap-3 p-2 hover:bg-background rounded-lg cursor-pointer transition-colors border border-transparent hover:border-border/50">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                        checked={formData.teamMembers.includes(emp._id)}
                        onChange={() => toggleTeamMember(emp._id)}
                      />
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                          {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                        </div>
                        <span className="text-sm font-medium">{emp.firstName} {emp.lastName}</span>
                        {emp.userId?.role && <span className="text-xs text-muted-foreground ml-auto">({emp.userId.role})</span>}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

          </form>
        </div>

        <div className="p-6 border-t bg-muted/20 flex justify-end gap-3 mt-auto">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2 rounded-full font-medium border bg-background hover:bg-muted transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="project-form"
            disabled={loading}
            className="px-6 py-2 rounded-full font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm flex items-center shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {project ? 'Save Changes' : 'Create Project'}
          </button>
        </div>

      </div>
    </div>
  );
}
