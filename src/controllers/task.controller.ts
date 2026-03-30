import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import prisma from '../lib/prisma'

// GET /api/projects/:projectId/tasks
export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  const projectId = req.params.projectId as string

  try {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.userId }
    })

    if (!project) {
      res.status(404).json({ error: 'Projet introuvable', code: 'PROJECT_NOT_FOUND' })
      return
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: { position: 'asc' },
      include: {
        subtasks: { orderBy: { position: 'asc' } }
      }
    })

    res.json({ tasks })
  } catch {
    res.status(500).json({ error: 'Erreur serveur', code: 'SERVER_ERROR' })
  }
}

// POST /api/projects/:projectId/tasks
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const projectId = req.params.projectId as string
  const { title, description } = req.body

  if (!title) {
    res.status(400).json({ error: 'Le titre est requis', code: 'MISSING_FIELDS' })
    return
  }

  try {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.userId }
    })

    if (!project) {
      res.status(404).json({ error: 'Projet introuvable', code: 'PROJECT_NOT_FOUND' })
      return
    }

    const lastTask = await prisma.task.findFirst({
      where: { projectId },
      orderBy: { position: 'desc' }
    })

    const position = lastTask ? lastTask.position + 1 : 0

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        position,
        status: 'TODO'
      }
    })

    res.status(201).json({ task })
  } catch {
    res.status(500).json({ error: 'Erreur serveur', code: 'SERVER_ERROR' })
  }
}

// PATCH /api/projects/:projectId/tasks/:id
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const projectId = req.params.projectId as string
  const id = req.params.id as string
  const { title, description, status } = req.body

  try {
    const task = await prisma.task.findFirst({
      where: { id, projectId, project: { userId: req.userId } }
    })

    if (!task) {
      res.status(404).json({ error: 'Tâche introuvable', code: 'TASK_NOT_FOUND' })
      return
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status })
      }
    })

    res.json({ task: updated })
  } catch {
    res.status(500).json({ error: 'Erreur serveur', code: 'SERVER_ERROR' })
  }
}

// PATCH /api/projects/:projectId/tasks/:id/reorder
export const reorderTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const projectId = req.params.projectId as string
  const id = req.params.id as string
  const { position } = req.body

  if (position === undefined) {
    res.status(400).json({ error: 'La position est requise', code: 'MISSING_FIELDS' })
    return
  }

  try {
    const task = await prisma.task.findFirst({
      where: { id, projectId, project: { userId: req.userId } }
    })

    if (!task) {
      res.status(404).json({ error: 'Tâche introuvable', code: 'TASK_NOT_FOUND' })
      return
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { position }
    })

    res.json({ task: updated })
  } catch {
    res.status(500).json({ error: 'Erreur serveur', code: 'SERVER_ERROR' })
  }
}

// DELETE /api/projects/:projectId/tasks/:id
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const projectId = req.params.projectId as string
  const id = req.params.id as string

  try {
    const task = await prisma.task.findFirst({
      where: { id, projectId, project: { userId: req.userId } }
    })

    if (!task) {
      res.status(404).json({ error: 'Tâche introuvable', code: 'TASK_NOT_FOUND' })
      return
    }

    await prisma.task.delete({ where: { id } })

    res.json({ message: 'Tâche supprimée avec succès' })
  } catch {
    res.status(500).json({ error: 'Erreur serveur', code: 'SERVER_ERROR' })
  }
}