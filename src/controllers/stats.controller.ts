import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import prisma from '../lib/prisma'

export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!

    const [
      totalProjects,
      projectsByStatus,
      totalTasks,
      tasksByStatus,
      recentProjects
    ] = await Promise.all([
      prisma.project.count({ where: { userId } }),

      prisma.project.groupBy({
        by: ['status'],
        where: { userId },
        _count: { status: true }
      }),

      prisma.task.count({
        where: { project: { userId } }
      }),

      prisma.task.groupBy({
        by: ['status'],
        where: { project: { userId } },
        _count: { status: true }
      }),

      prisma.project.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          isPublic: true,
          updatedAt: true,
          _count: { select: { tasks: true } }
        }
      })
    ])

    const statusMap = (arr: { status: string; _count: { status: number } }[]) =>
      arr.reduce((acc, item) => {
        acc[item.status] = item._count.status
        return acc
      }, {} as Record<string, number>)

    res.json({
      projects: {
        total: totalProjects,
        byStatus: statusMap(projectsByStatus)
      },
      tasks: {
        total: totalTasks,
        byStatus: statusMap(tasksByStatus)
      },
      recentProjects
    })
  } catch {
    res.status(500).json({ error: 'Erreur serveur', code: 'SERVER_ERROR' })
  }
}