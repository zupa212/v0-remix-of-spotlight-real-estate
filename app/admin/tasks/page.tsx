'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminSidebar } from '@/components/admin-sidebar'
import { AdminBreadcrumbs } from '@/components/admin-breadcrumbs'
import { AdminBackButton } from '@/components/admin-back-button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle2, Circle, Clock, User, Calendar, Plus } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

interface Task {
  id: string
  title: string
  description: string
  due_at: string
  status: string
  created_at: string
  completed_at: string | null
  lead?: { name: string; email: string }
  assignee?: { name: string }
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    fetchTasks()

    // Realtime subscription
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        lead_id,
        assignee_id
      `)
      .order('due_at', { ascending: true })

    // Fetch leads and assignees separately
    const leadIds = (data || []).map((t: any) => t.lead_id).filter((id: string | null) => id !== null) as string[]
    const assigneeIds = (data || []).map((t: any) => t.assignee_id).filter((id: string | null) => id !== null) as string[]
    
    let leadsMap: Record<string, { name: string; email: string }> = {}
    if (leadIds.length > 0) {
      const { data: leadsData } = await supabase
        .from('leads')
        .select('id, name, email')
        .in('id', leadIds)
      if (leadsData) {
        leadsData.forEach((lead: any) => {
          leadsMap[lead.id] = { name: lead.name, email: lead.email }
        })
      }
    }

    let assigneesMap: Record<string, { name: string }> = {}
    if (assigneeIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', assigneeIds)
      if (profilesData) {
        profilesData.forEach((profile: any) => {
          assigneesMap[profile.id] = { name: profile.name }
        })
      }
    }

    // Combine data
    const tasksWithRelations = (data || []).map((task: any) => ({
      ...task,
      lead: task.lead_id && leadsMap[task.lead_id] ? leadsMap[task.lead_id] : null,
      assignee: task.assignee_id && assigneesMap[task.assignee_id] ? assigneesMap[task.assignee_id] : null,
    }))

    if (!error && tasksWithRelations) {
      setTasks(tasksWithRelations)
    }
    setLoading(false)
  }

  async function toggleTaskStatus(taskId: string, currentStatus: string) {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    const updates: any = {
      status: newStatus,
      updated_at: new Date().toISOString()
    }
    
    if (newStatus === 'completed') {
      updates.completed_at = new Date().toISOString()
    } else {
      updates.completed_at = null
    }

    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)

    if (!error) {
      fetchTasks()
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    if (filter === 'pending') return task.status === 'pending'
    if (filter === 'completed') return task.status === 'completed'
    if (filter === 'overdue') {
      return task.status !== 'completed' && new Date(task.due_at) < new Date()
    }
    return true
  })

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.status !== 'completed' && new Date(t.due_at) < new Date()).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminSidebar />
        <div className="lg:pl-64">
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="lg:pl-64">
        <div className="p-8 space-y-6">
          <AdminBreadcrumbs items={[{ label: "Tasks" }]} />
          <AdminBackButton href="/admin" label="Back to Dashboard" />
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Tasks</h1>
              <p className="text-slate-600">Manage your tasks and follow-ups</p>
            </div>
            <Button asChild>
              <Link href="/admin/tasks/new">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Link>
            </Button>
          </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Circle className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            </div>
            <Clock className="h-8 w-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All ({stats.total})
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
          >
            Pending ({stats.pending})
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilter('completed')}
          >
            Completed ({stats.completed})
          </Button>
          <Button
            variant={filter === 'overdue' ? 'default' : 'outline'}
            onClick={() => setFilter('overdue')}
          >
            Overdue ({stats.overdue})
          </Button>
        </div>
      </Card>

      {/* Tasks List */}
      <Card className="p-6">
        <div className="space-y-4">
          {filteredTasks.map(task => {
            const isOverdue = task.status !== 'completed' && new Date(task.due_at) < new Date()
            const dueDate = new Date(task.due_at)

            return (
              <div
                key={task.id}
                className={`flex items-start gap-4 p-4 rounded-lg border ${
                  task.status === 'completed' ? 'bg-muted/50' : 'bg-background'
                } ${isOverdue ? 'border-red-200 bg-red-50/50' : ''}`}
              >
                <Checkbox
                  checked={task.status === 'completed'}
                  onCheckedChange={() => toggleTaskStatus(task.id, task.status)}
                  className="mt-1"
                />

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={task.status === 'completed' ? 'secondary' : isOverdue ? 'destructive' : 'default'}>
                      {task.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {task.lead && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{task.lead.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                        {format(dueDate, 'MMM dd, yyyy')}
                      </span>
                    </div>
                    {task.assignee && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>Assigned to: {task.assignee.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/admin/tasks/${task.id}`}>View Details</Link>
                    </Button>
                    {task.lead && (
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/admin/leads/${task.lead.id}`}>View Lead</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tasks found</p>
            </div>
          )}
        </div>
      </Card>
        </div>
      </div>
    </div>
  )
}

