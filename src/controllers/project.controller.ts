import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import prisma from '../lib/prisma'

// GET /api/projects
export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, priority } = req.query

  try {
    const projects = await prisma.project.findMany({
      where: {
        userId: req.userId,
        ...(status && { status: status as any }),
        ...(priority && { priority: priority as any })
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { tasks: true } }
      }
    })

    res.json({ projects })
  } catch {
    res.status(500).json({ error: 'Erreur serveur', code: 'SERVER_ERROR' })
  }
}

// GET /api/projects/:id
export const getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string

  try {
    const project = await prisma.project.findFirst({
      where: { id, userId: req.userId },
      include: {
        tasks: {
          orderBy: { position: 'asc' },
          include: {
            subtasks: { orderBy: { position: 'asc' } }
          }
        }
      }
    })

    if (!project) {
      res.status(404).json({ error: 'Projet introuvable', code: 'PROJECT_NOT_FOUND' })
      return
    }

    res.json({ project })
  } catch {
    res.status(500).json({ error: 'Erreur serveur', code: 'SERVER_ERROR' })
  }
}

// POST /api/projects
export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, status, priority, estimatedHours } = req.body

  if (!title) {
    res.status(400).json({ error: 'Le titre est requis', code: 'MISSING_FIELDS' })
    return
  }

  try {
    const project = await prisma.project.create({
      data: {
        title,
        description,
        status: status ?? 'IDEA',
        priority: priority ?? 'MEDIUM',
        estimatedHours,
        userId: req.userId!
      }
    })

    res.status(201).json({ project })
  } catch {
    res.status(500).json({ error: 'Erreur serveur', code: 'SERVER_ERROR' })
  }
}

// PATCH /api/projects/:id
export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string
  const { title, description, status, priority, estimatedHours, githubUrl, demoUrl, techStack, context, imageUrl, images, githubDisabled } = req.body

  try {
    const project = await prisma.project.findFirst({
      where: { id, userId: req.userId }
    })

    if (!project) {
      res.status(404).json({ error: 'Projet introuvable', code: 'PROJECT_NOT_FOUND' })
      return
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(estimatedHours !== undefined && { estimatedHours }),
        ...(githubUrl !== undefined && { githubUrl }),
        ...(demoUrl !== undefined && { demoUrl }),
        ...(techStack !== undefined && { techStack }),
        ...(context !== undefined && { context }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(images !== undefined && { images }),
        ...(githubDisabled !== undefined && { githubDisabled }),
      }
    })

    res.json({ project: updated })
  } catch {
    res.status(500).json({ error: 'Erreur serveur', code: 'SERVER_ERROR' })
  }
}

// PATCH /api/projects/:id/publish
export const togglePublish = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string

  try {
    const project = await prisma.project.findFirst({
      where: { id, userId: req.userId }
    })

    if (!project) {
      res.status(404).json({ error: 'Projet introuvable', code: 'PROJECT_NOT_FOUND' })
      return
    }

    if (!project.isPublic) {
      if (!project.githubUrl || !project.demoUrl || !project.techStack) {
        res.status(400).json({
          error: 'githubUrl, demoUrl et techStack sont requis avant de publier',
          code: 'MISSING_PORTFOLIO_FIELDS'
        })
        return
      }

      if (project.status === 'IDEA' || project.status === 'ON_HOLD') {
        res.status(400).json({
          error: 'Un projet IDEA ou ON_HOLD ne peut pas être publié',
          code: 'INVALID_STATUS_FOR_PUBLISH'
        })
        return
      }
    }

    const updated = await prisma.project.update({
      where: { id },
      data: { isPublic: !project.isPublic }
    })

    res.json({ project: updated })
  } catch {
    res.status(500).json({ error: 'Erreur serveur', code: 'SERVER_ERROR' })
  }
}

// DELETE /api/projects/:id
export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string

  try {
    const project = await prisma.project.findFirst({
      where: { id, userId: req.userId }
    })

    if (!project) {
      res.status(404).json({ error: 'Projet introuvable', code: 'PROJECT_NOT_FOUND' })
      return
    }

    await prisma.project.delete({ where: { id } })

    res.json({ message: 'Projet supprimé avec succès' })
  } catch {
    res.status(500).json({ error: 'Erreur serveur', code: 'SERVER_ERROR' })
  }
}