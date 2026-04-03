import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import projectRoutes from './routes/project.routes'
import taskRoutes from './routes/task.routes'
import subtaskRoutes from './routes/subtask.routes'
import publicRoutes from './routes/public.routes'
import statsRoutes from './routes/stats.routes'
import uploadRoutes from './routes/upload.routes'
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? []

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/projects/:projectId/tasks', taskRoutes)
app.use('/api/tasks/:taskId/subtasks', subtaskRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/upload', uploadRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})