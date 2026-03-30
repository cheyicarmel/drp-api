import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import prisma from '../lib/prisma'

// GET /api/tasks/:taskId/subtasks
export const getSubtasks = async (req: AuthRequest, res: Response): Promise<void> => {
  const taskId = req.params.taskId as string

  try {
    const task = await prisma.task.findFirst({
      where: { id: taskId, project: { userId: req.userId } }
    })

    if (!task) {
      res.status(404).json({ error: 'Tâche introuvable', code: 'TASK_NOT_FOUND' })
      return
    }

    const subtasks = await prisma.subtask.findMany({
      where: { taskId },
      orderBy: { position: 'asc' }
    })

    res.json({ subtasks })
  } catch {
    res.status(500).json({ error: 'Erreur serveur', code: 'SERVER_ERROR' })
  }
}

// POST /api/tasks/:taskId/subtasks
export const createSubtask = async (req: AuthRequest, res: Response): Promise<void> => {
  const taskId = req.params.taskId as string
  const { title } = req.body

  if (!title) {
    res.status(400).json({ error: 'Le titre est requis', code: 'MISSING_FIELDS' })
    return
  }

  try {
    const task = await prisma.task.findFirst({
      where: { id: taskId, project: { userId: req.userId } }
    })

    if (!task) {
      res.status(404).json({ error: 'Tâche introuvable', code: 'TASK_NOT_FOUND' })
      return
    }

    const lastSubtask = await prisma.subtask.findFirst({
      where: { taskId },
      orderBy: { position: 'desc' }
    })

    const position = lastSubtask ? lastSubtask.position + 1 : 0

    const subtask = await prisma.subtask.create({
      data: { title, taskId, position, isDone: false }
    })

    res.status(201).json({ subtask })
  } catch {
    res.status(500).json({ error: 'Erreur serveur', code: 'SERVER_ERROR' })
  }
}

// PATCH /api/tasks/:taskId/subtasks/:id
export const updateSubtask = async (req: AuthRequest, res: Response): Promise<void> => {
  const taskId = req.params.taskId as string
  const id = req.params.id as string
  const { title, isDone } = req.body

  try {
    const subtask = await prisma.subtask.findFirst({
      where: { id, taskId, task: { project: { userId: req.userId } } }
    })

    if (!subtask) {
      res.status(404).json({ error: 'Sous-tâche introuvable', code: 'SUBTASK_NOT_FOUND' })
      return
    }

    const updated = await prisma.subtask.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(isDone !== undefined && { isDone })
      }
    })

    res.json({ subtask: updated })
  } catch {
    res.status(500).json({ error: 'Erreur serveur', code: 'SERVER_ERROR' })
  }
}

// PATCH /api/tasks/:taskId/subtasks/:id/reorder
export const reorderSubtask = async (req: AuthRequest, res: Response): Promise<void> => {
  const taskId = req.params.taskId as string
  const id = req.params.id as string
  const { position } = req.body

  if (position === undefined) {
    res.status(400).json({ error: 'La position est requise', code: 'MISSING_FIELDS' })
    return
  }

  try {
    const subtask = await prisma.subtask.findFirst({
      where: { id, taskId, task: { project: { userId: req.userId } } }
    })

    if (!subtask) {
      res.status(404).json({ error: 'Sous-tâche introuvable', code: 'SUBTASK_NOT_FOUND' })
      return
    }

    const updated = await prisma.subtask.update({
      where: { id },
      data: { position }
    })

    res.json({ subtask: updated })
  } catch {
    res.status(500).json({ error: 'Erreur serveur', code: 'SERVER_ERROR' })
  }
}

// DELETE /api/tasks/:taskId/subtasks/:id
export const deleteSubtask = async (req: AuthRequest, res: Response): Promise<void> => {
  const taskId = req.params.taskId as string
  const id = req.params.id as string

  try {
    const subtask = await prisma.subtask.findFirst({
      where: { id, taskId, task: { project: { userId: req.userId } } }
    })

    if (!subtask) {
      res.status(404).json({ error: 'Sous-tâche introuvable', code: 'SUBTASK_NOT_FOUND' })
      return
    }

    await prisma.subtask.delete({ where: { id } })

    res.json({ message: 'Sous-tâche supprimée avec succès' })
  } catch {
    res.status(500).json({ error: 'Erreur serveur', code: 'SERVER_ERROR' })
  }
}