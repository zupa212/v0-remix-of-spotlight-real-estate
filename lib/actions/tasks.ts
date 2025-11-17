"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Task validation schema
const taskSchema = z.object({
  lead_id: z.string().uuid("Lead ID must be a valid UUID").nullable().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  due_at: z.string().datetime("Due date must be a valid datetime").optional(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).default("pending"),
  assignee_id: z.string().uuid("Assignee ID must be a valid UUID").nullable().optional(),
  template_id: z.string().uuid("Template ID must be a valid UUID").nullable().optional(),
})

const taskUpdateSchema = taskSchema.partial().extend({
  lead_id: z.string().uuid().nullable().optional(),
  due_at: z.string().datetime().optional(),
  assignee_id: z.string().uuid().nullable().optional(),
  template_id: z.string().uuid().nullable().optional(),
})

export type TaskInput = z.infer<typeof taskSchema>
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>

interface ActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Create a new task
 */
export async function createTask(
  input: TaskInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Unauthorized" }
    }

    // Validate input
    const validated = taskSchema.parse(input)

    // Insert task
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        lead_id: validated.lead_id || null,
        title: validated.title,
        description: validated.description || null,
        due_at: validated.due_at || null,
        status: validated.status,
        assignee_id: validated.assignee_id || null,
        template_id: validated.template_id || null,
      })
      .select("id")
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Revalidate paths
    revalidatePath("/admin/tasks")
    revalidatePath("/admin/leads")

    return { success: true, data: { id: data.id } }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: error instanceof Error ? error.message : "Failed to create task" }
  }
}

/**
 * Update an existing task
 */
export async function updateTask(
  id: string,
  input: TaskUpdateInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Unauthorized" }
    }

    // Validate input
    const validated = taskUpdateSchema.parse(input)

    // If status is being set to completed, set completed_at
    const updateData: any = { ...validated }
    if (validated.status === "completed") {
      updateData.completed_at = new Date().toISOString()
    } else if (validated.status && validated.status !== "completed") {
      updateData.completed_at = null
    }

    // Update task
    const { data, error } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", id)
      .select("id")
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Revalidate paths
    revalidatePath("/admin/tasks")
    revalidatePath(`/admin/tasks/${id}`)
    revalidatePath("/admin/leads")

    return { success: true, data: { id: data.id } }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: error instanceof Error ? error.message : "Failed to update task" }
  }
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Unauthorized" }
    }

    // Delete task
    const { error } = await supabase.from("tasks").delete().eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    // Revalidate paths
    revalidatePath("/admin/tasks")
    revalidatePath("/admin/leads")

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete task" }
  }
}

/**
 * Toggle task completion status (convenience function)
 */
export async function toggleTaskStatus(
  id: string,
  currentStatus: string
): Promise<ActionResult<{ id: string }>> {
  const newStatus = currentStatus === "completed" ? "pending" : "completed"
  return updateTask(id, { status: newStatus as any })
}

