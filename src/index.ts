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

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'DrP API is running' })
})

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