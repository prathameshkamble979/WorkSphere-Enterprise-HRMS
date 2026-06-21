import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Target, Calendar, Flag, AlertCircle, CircleDashed } from 'lucide-react';
import { getProjects, deleteProject, updateProject } from '../api/projectService';
import type { Project } from '../types/project';
import ProjectDetailsModal from '../components/ProjectDetailsModal';
import ProjectModal from '../components/ProjectModal';
import { Edit, Trash2 } from 'lucide-react';
import RoleGuard from '../../../shared/components/RoleGuard';

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleAdd = () => {
    setSelectedProject(null);
    setIsModalOpen(true);
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        fetchProjects();
      } catch (error) {
        console.error('Failed to delete project', error);
        alert('Failed to delete project');
      }
    }
  };

  const handleStatusChange = async (project: Project, newStatus: string) => {
    try {
      await updateProject(project._id, { status: newStatus });
      fetchProjects();
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status');
    }
  };

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setIsDetailsModalOpen(true);
  };

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getProjects(page, 10, search, statusFilter);
      if (res.success && Array.isArray(res.data)) {
        setProjects(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
          setTotalRecords(res.pagination.total);
        }
      }
    } catch (error) {
      console.error('Failed to fetch projects', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProjects();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchProjects]);

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 fade-in">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">Track deliverables, timelines, and team resourcing.</p>
        </div>
        <RoleGuard allowedRoles={['Admin', 'Manager']}>
          <button 
            onClick={handleAdd}
            className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2 shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </button>
        </RoleGuard>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-2 rounded-2xl border shadow-sm">
        <div className="relative w-full sm:w-96 flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border-none bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select 
            className="h-10 px-4 rounded-xl border bg-background text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-card rounded-2xl border p-6 shadow-sm animate-pulse">
              <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-muted rounded w-1/4 mb-6"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </div>
            </div>
          ))
        ) : projects.length === 0 ? (
          <div className="col-span-full py-16 text-center border rounded-2xl bg-card border-dashed">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <div className="bg-muted p-4 rounded-full mb-4">
                <Target className="h-8 w-8 opacity-50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No projects found</h3>
              <p className="mt-1">Create a project to start collaborating with your team.</p>
            </div>
          </div>
        ) : (
          projects.map((project) => (
            <div 
              key={project._id} 
              className="bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all flex flex-col group relative overflow-hidden cursor-pointer"
              onClick={() => handleViewDetails(project)}
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="relative inline-flex items-center">
                    <CircleDashed className={`absolute left-2.5 h-3 w-3 pointer-events-none
                      ${project.status === 'In Progress' ? 'text-primary' : ''}
                      ${project.status === 'Completed' ? 'text-success' : ''}
                      ${project.status === 'Planning' ? 'text-muted-foreground' : ''}
                      ${project.status === 'On Hold' ? 'text-warning' : ''}
                    `} />
                    <select
                      value={project.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleStatusChange(project, e.target.value)}
                      className={`appearance-none cursor-pointer outline-none pl-7 pr-6 py-1 rounded-full text-xs font-semibold transition-colors border border-transparent hover:border-border/50
                        ${project.status === 'In Progress' ? 'bg-primary/10 text-primary' : ''}
                        ${project.status === 'Completed' ? 'bg-success/10 text-success' : ''}
                        ${project.status === 'Planning' ? 'bg-muted text-muted-foreground' : ''}
                        ${project.status === 'On Hold' ? 'bg-warning/10 text-warning' : ''}
                      `}
                    >
                      <option value="Planning" className="text-foreground bg-background">Planning</option>
                      <option value="In Progress" className="text-foreground bg-background">In Progress</option>
                      <option value="On Hold" className="text-foreground bg-background">On Hold</option>
                      <option value="Completed" className="text-foreground bg-background">Completed</option>
                    </select>
                    <div className="absolute right-2 pointer-events-none opacity-50">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <RoleGuard allowedRoles={['Admin', 'Manager']}>
                      <div className="flex items-center gap-1 bg-background p-0.5 rounded-lg shadow-sm border" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEdit(project); }}
                          className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(project._id); }}
                          className="p-1 text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-md transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </RoleGuard>

                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded
                      ${project.priority === 'High' ? 'text-danger bg-danger/10' : 
                        project.priority === 'Medium' ? 'text-warning bg-warning/10' : 
                        'text-muted-foreground bg-muted'}
                    `}>
                      {project.priority === 'High' && <AlertCircle className="h-3 w-3" />}
                      {project.priority === 'Medium' && <Flag className="h-3 w-3" />}
                      {project.priority} Priority
                    </span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{project.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-6">{project.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4"/> Deadline</span>
                    <span className="font-medium text-foreground">{new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2"><Target className="h-4 w-4"/> Client</span>
                    <span className="font-medium text-foreground">{project.clientId?.companyName || 'Internal'}</span>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t bg-muted/20 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {project.teamMembers?.slice(0, 3).map((member, i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                    </div>
                  ))}
                  {project.teamMembers?.length > 3 && (
                    <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                      +{project.teamMembers.length - 3}
                    </div>
                  )}
                  {(!project.teamMembers || project.teamMembers.length === 0) && (
                    <span className="text-xs text-muted-foreground italic">No team assigned</span>
                  )}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleViewDetails(project); }}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && projects.length > 0 && (
        <div className="flex items-center justify-between pt-4">
          <span className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{totalRecords}</span> projects
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border bg-background text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border bg-background text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchProjects()}
        project={selectedProject}
      />
      <ProjectDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        project={selectedProject}
      />
    </div>
  );
}
