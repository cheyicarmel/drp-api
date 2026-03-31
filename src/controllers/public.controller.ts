import { Request, Response } from 'express'
import prisma from '../lib/prisma'

// GET /api/public/projects
export const getPublicProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const projects = await prisma.project.findMany({
      where: { isPublic: true },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        githubUrl: true,
        demoUrl: true,
        techStack: true,
        context: true,
        imageUrl: true,
        images: true,
        githubDisabled: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' }
    })

    res.json({ projects })
  } catch {
    res.status(500).json({ error: 'Erreur serveur', code: 'SERVER_ERROR' })
  }
}