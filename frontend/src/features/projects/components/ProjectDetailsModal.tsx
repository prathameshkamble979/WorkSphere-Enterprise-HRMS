import { X, Target, Calendar, Flag, CircleDashed, Users, Briefcase } from 'lucide-react';
import type { Project } from '../types/project';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

export default function ProjectDetailsModal({ isOpen, onClose, project }: ProjectDetailsModalProps) {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm fade-in p-4">
      <div className="bg-background w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-border/50">
        
        {/* Header Background */}
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-primary to-primary/80 relative">
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Avatar (Absolutely positioned to perfectly straddle the header line) */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 h-28 w-28 rounded-full border-[6px] border-background shadow-lg overflow-hidden flex items-center justify-center bg-background z-20">
            <div className="h-full w-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-3xl shadow-inner">
              <Target className="h-12 w-12" />
            </div>
          </div>
        </div>

        <div className="pt-16 px-8 pb-8 overflow-y-auto">
          {/* Profile Header section */}
          <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight mb-3">{project.name}</h1>
            
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
                ${project.status === 'In Progress' ? 'bg-primary/10 text-primary' : ''}
                ${project.status === 'Completed' ? 'bg-success/10 text-success' : ''}
                ${project.status === 'Planning' ? 'bg-muted text-muted-foreground' : ''}
                ${project.status === 'On Hold' ? 'bg-warning/10 text-warning' : ''}
              `}>
                <CircleDashed className="h-3 w-3" />
                {project.status}
              </span>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
                ${project.priority === 'High' ? 'text-danger bg-danger/10' : 
                  project.priority === 'Medium' ? 'text-warning bg-warning/10' : 
                  'text-muted-foreground bg-muted'}
              `}>
                <Flag className="h-3 w-3" />
                {project.priority} Priority
              </span>
            </div>
          </div>

          <div className="mb-6 bg-muted/30 p-4 rounded-xl border border-border/50">
            <p className="text-sm text-foreground/80 leading-relaxed">{project.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Timeline & Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Project Details</h3>
              
              <div className="flex items-center gap-3 p-3 bg-background rounded-xl border shadow-sm">
                <div className="p-2.5 bg-primary/10 text-primary rounded-lg"><Briefcase className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Client</p>
                  <p className="text-sm font-medium text-foreground truncate">{project.clientId?.companyName || 'Internal Project'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-background rounded-xl border shadow-sm">
                <div className="p-2.5 bg-primary/10 text-primary rounded-lg"><Calendar className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Timeline</p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Team Resourcing</h3>
              
              <div className="flex items-start gap-3 p-3 bg-background rounded-xl border shadow-sm h-full">
                <div className="p-2.5 bg-primary/10 text-primary rounded-lg mt-0.5"><Users className="h-5 w-5" /></div>
                <div className="min-w-0 w-full">
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">Assigned Members</p>
                  
                  {project.teamMembers && project.teamMembers.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {project.teamMembers.map(member => (
                        <div key={member._id} className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                            {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-foreground truncate">
                            {member.firstName} {member.lastName}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic mt-2">No team members assigned</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
