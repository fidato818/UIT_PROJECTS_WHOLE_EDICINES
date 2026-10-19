import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskPriority } from '../types';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight,
  TrendingUp,
  FolderGit2
} from 'lucide-react';
import { TableSkeleton, EmptyStateView, ErrorStateView } from './FeedbackState';

export const WorkflowScreen: React.FC = () => {
  const { 
    tasks, 
    projects, 
    users, 
    toggleTaskComplete, 
    updateTaskDeadline, 
    setSelectedDetail, 
    setNewRecordModal,
    simulationState 
  } = useApp();

  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'due_today' | 'overdue' | 'upcoming' | 'completed'>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fixed reference date per instructions
  const today = '2026-10-19';

  // Compute metrics
  const metrics = useMemo(() => {
    const overdue = tasks.filter((t) => !t.completed && t.deadline < today);
    const dueToday = tasks.filter((t) => !t.completed && t.deadline === today);
    const completed = tasks.filter((t) => t.completed);
    const totalRemainingHours = tasks
      .filter((t) => !t.completed)
      .reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
    const completionRate = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0;

    return {
      overdueCount: overdue.length,
      dueTodayCount: dueToday.length,
      completedCount: completed.length,
      totalRemainingHours,
      completionRate,
    };
  }, [tasks, today]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Urgency filter
      if (urgencyFilter === 'due_today' && (task.completed || task.deadline !== today)) return false;
      if (urgencyFilter === 'overdue' && (task.completed || task.deadline >= today)) return false;
      if (urgencyFilter === 'upcoming' && (task.completed || task.deadline <= today)) return false;
      if (urgencyFilter === 'completed' && !task.completed) return false;

      // Project filter
      if (projectFilter !== 'all' && task.projectId !== projectFilter) return false;

      // Assignee filter
      if (assigneeFilter !== 'all' && task.assignedUserId !== assigneeFilter) return false;

      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesNotes = task.notes?.toLowerCase().includes(query);
        const project = projects.find((p) => p.id === task.projectId);
        const matchesProject = project?.name.toLowerCase().includes(query);
        if (!matchesTitle && !matchesNotes && !matchesProject) return false;
      }

      return true;
    });
  }, [tasks, urgencyFilter, projectFilter, assigneeFilter, searchQuery, today, projects]);

  if (simulationState === 'error') {
    return <ErrorStateView title="Workflow Synchronization Failed" message="The workflow scheduler could not retrieve local project task sequences. Please retry to refresh the cache." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Mission */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
            Project Workflow & Task Deadlines
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track daily milestones, balance team workload, and eliminate deadline bottlenecks across active projects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setNewRecordModal('task')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Daily Task</span>
          </button>
        </div>
      </div>

      {/* Daily Progress & Deadline Status Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Due Today (2026-10-19)</span>
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-display tabular-nums">
            {metrics.dueTodayCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Immediate daily operational focus
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Overdue Milestones</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 font-display tabular-nums">
            {metrics.overdueCount}
          </div>
          <p className="text-[11px] text-rose-600 font-medium mt-1">
            Requires deadline rescheduling or escalation
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Remaining Burndown</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-display tabular-nums font-mono">
            {metrics.totalRemainingHours.toFixed(1)} hrs
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Allocated across {tasks.filter(t => !t.completed).length} open tasks
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Sprint Completion</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-display tabular-nums font-mono">
            {metrics.completionRate}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {metrics.completedCount} of {tasks.length} tasks closed
          </p>
        </div>
      </div>

      {/* Active Projects Quick Status Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900 font-display">
              Active Project Progress & Deadlines
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            {projects.length} Active Local Engagements
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {projects.map((proj) => {
            const projectTasks = tasks.filter((t) => t.projectId === proj.id);
            const openProjectTasks = projectTasks.filter((t) => !t.completed);
            const isSelected = projectFilter === proj.id;

            return (
              <div
                key={proj.id}
                onClick={() => setProjectFilter(isSelected ? 'all' : proj.id)}
                className={`cursor-pointer rounded-lg border p-3 transition-all ${
                  isSelected
                    ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-xs font-bold text-slate-900 truncate" title={proj.name}>
                    {proj.name}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {proj.code}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                  <span>Progress</span>
                  <span className="font-semibold text-slate-800 tabular-nums font-mono">
                    {proj.progress}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full ${
                      proj.riskLevel === 'high'
                        ? 'bg-rose-500'
                        : proj.progress >= 80
                        ? 'bg-emerald-500'
                        : 'bg-slate-900'
                    }`}
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Target: <strong className="text-slate-700 font-mono">{proj.deadline}</strong></span>
                  <span className="font-medium text-slate-700">
                    {openProjectTasks.length} tasks open
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Urgency Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-lg shrink-0">
            {[
              { id: 'all', label: 'All Tasks' },
              { id: 'due_today', label: 'Due Today' },
              { id: 'overdue', label: 'Overdue' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'completed', label: 'Completed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setUrgencyFilter(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  urgencyFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search task title, notes, or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-800"
            />
          </div>
        </div>

        {/* Dropdown Filters (Project & Assignee) */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter by:</span>
          </div>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="all">All Projects ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="all">All Assignees ({users.length})</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>

          {(projectFilter !== 'all' || assigneeFilter !== 'all' || searchQuery.trim() || urgencyFilter !== 'all') && (
            <button
              onClick={() => {
                setProjectFilter('all');
                setAssigneeFilter('all');
                setSearchQuery('');
                setUrgencyFilter('all');
              }}
              className="text-xs text-slate-500 hover:text-slate-900 underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Task List Table or Skeletons */}
      {simulationState === 'loading' ? (
        <TableSkeleton rows={6} columns={5} />
      ) : filteredTasks.length === 0 ? (
        <EmptyStateView
          title="No Tasks Match Your Active Criteria"
          description="Try broadening your filters or schedule a new task deadline to assign to local team members."
          actionLabel="Schedule New Task"
          onAction={() => setNewRecordModal('task')}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                  <th className="py-3 px-4 w-10">Done</th>
                  <th className="py-3 px-4">Task Title & Details</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Deadline & Urgency</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4 text-right">Burndown</th>
                  <th className="py-3 px-4 w-12 text-center">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((task) => {
                  const project = projects.find((p) => p.id === task.projectId);
                  const assignee = users.find((u) => u.id === task.assignedUserId);
                  const isOverdue = !task.completed && task.deadline < today;
                  const isToday = !task.completed && task.deadline === today;
                  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;

                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        task.completed ? 'bg-slate-50/40 text-slate-400' : 'text-slate-700'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 align-top">
                        <button
                          onClick={() => toggleTaskComplete(task.id)}
                          className="text-slate-400 hover:text-emerald-600 transition-colors mt-0.5 focus:outline-none"
                          title={task.completed ? 'Mark incomplete' : 'Mark completed'}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Title & Subtasks */}
                      <td className="py-3 px-4 align-top">
                        <button
                          onClick={() => setSelectedDetail({ type: 'task', id: task.id })}
                          className={`text-left font-medium hover:text-slate-900 transition-colors block ${
                            task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </button>
                        
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                          <span>{task.category}</span>
                          {task.subtasks.length > 0 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>
                                {completedSubtasks}/{task.subtasks.length} subtasks
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Project */}
                      <td className="py-3 px-4 align-top whitespace-nowrap">
                        <span className="font-medium text-slate-800">
                          {project?.code || 'PRJ-UNASSIGNED'}
                        </span>
                        <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                          {project?.name}
                        </div>
                      </td>

                      {/* Interactive Deadline Picker */}
                      <td className="py-3 px-4 align-top whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="date"
                            value={task.deadline}
                            onChange={(e) => updateTaskDeadline(task.id, e.target.value)}
                            disabled={task.completed}
                            className={`px-1.5 py-0.5 text-xs font-mono tabular-nums rounded border ${
                              isOverdue
                                ? 'border-rose-300 bg-rose-50 text-rose-800 font-semibold'
                                : isToday
                                ? 'border-amber-300 bg-amber-50 text-amber-800 font-semibold'
                                : 'border-slate-200 bg-white text-slate-700'
                            } focus:outline-none focus:ring-1 focus:ring-slate-900`}
                          />
                        </div>
                        <div className="text-[10px] mt-0.5">
                          {isOverdue && <span className="text-rose-600 font-medium">Overdue milestone</span>}
                          {isToday && <span className="text-amber-700 font-medium">Due by 5:00 PM today</span>}
                          {!isOverdue && !isToday && !task.completed && (
                            <span className="text-slate-400">Scheduled on calendar</span>
                          )}
                          {task.completed && <span className="text-emerald-600">Task closed</span>}
                        </div>
                      </td>

                      {/* Assignee */}
                      <td className="py-3 px-4 align-top whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {assignee?.avatar ? (
                            <img
                              src={assignee.avatar}
                              alt={assignee.name}
                              referrerPolicy="no-referrer"
                              className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                              {assignee?.name.charAt(0) || 'U'}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-800 text-xs">
                              {assignee?.name || 'Unassigned'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {assignee?.role || 'Team Member'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Burndown */}
                      <td className="py-3 px-4 align-top text-right whitespace-nowrap font-mono tabular-nums">
                        <span className="font-semibold text-slate-800">
                          {task.estimatedHours} hrs
                        </span>
                        {task.actualHours && (
                          <div className="text-[10px] text-slate-400">
                            spent {task.actualHours} hrs
                          </div>
                        )}
                      </td>

                      {/* Detail View Trigger */}
                      <td className="py-3 px-4 align-top text-center">
                        <button
                          onClick={() => setSelectedDetail({ type: 'task', id: task.id })}
                          className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                          title="Open Task Details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
