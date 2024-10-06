"use client"

import { useState, useCallback } from 'react'
import ReactFlow, { 
  Node, 
  Edge, 
  Controls, 
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Plus, Upload, Edit, Trash } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Video {
  id: string
  name: string
  url: string
}

interface Choice {
  id: string
  time: number
  options: string[]
  sourceVideoId: string
  targetVideoId: string
}

interface Project {
  id: string
  name: string
  videos: Video[]
  choices: Choice[]
}

export default function InteractiveCinemaManager() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false)
  const [isNewVideoDialogOpen, setIsNewVideoDialogOpen] = useState(false)
  const [isNewChoiceDialogOpen, setIsNewChoiceDialogOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newVideoName, setNewVideoName] = useState('')
  const [newVideoFile, setNewVideoFile] = useState<File | null>(null)
  const [newChoiceTime, setNewChoiceTime] = useState(0)
  const [newChoiceOptions, setNewChoiceOptions] = useState(['', ''])
  const [newChoiceTargetVideoId, setNewChoiceTargetVideoId] = useState('')

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const handleCreateProject = () => {
    if (newProjectName) {
      const newProject: Project = {
        id: Date.now().toString(),
        name: newProjectName,
        videos: [],
        choices: []
      }
      setProjects([...projects, newProject])
      setSelectedProject(newProject)
      setNewProjectName('')
      setIsNewProjectDialogOpen(false)
      updateFlowChart(newProject)
    }
  }

  const handleCreateVideo = () => {
    if (selectedProject && newVideoName && newVideoFile) {
      const newVideo: Video = {
        id: Date.now().toString(),
        name: newVideoName,
        url: URL.createObjectURL(newVideoFile)
      }
      const updatedProject = {
        ...selectedProject,
        videos: [...selectedProject.videos, newVideo]
      }
      setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p))
      setSelectedProject(updatedProject)
      setSelectedVideo(newVideo)
      setNewVideoName('')
      setNewVideoFile(null)
      setIsNewVideoDialogOpen(false)
      updateFlowChart(updatedProject)
    }
  }

  const handleCreateChoice = () => {
    if (selectedProject && selectedVideo && newChoiceTime >= 0 && newChoiceOptions.every(o => o) && newChoiceTargetVideoId) {
      const newChoice: Choice = {
        id: Date.now().toString(),
        time: newChoiceTime,
        options: newChoiceOptions,
        sourceVideoId: selectedVideo.id,
        targetVideoId: newChoiceTargetVideoId
      }
      const updatedProject = {
        ...selectedProject,
        choices: [...selectedProject.choices, newChoice]
      }
      setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p))
      setSelectedProject(updatedProject)
      setNewChoiceTime(0)
      setNewChoiceOptions(['', ''])
      setNewChoiceTargetVideoId('')
      setIsNewChoiceDialogOpen(false)
      updateFlowChart(updatedProject)
    }
  }

  const updateFlowChart = (project: Project) => {
    const videoNodes: Node[] = project.videos.map(video => ({
      id: video.id,
      data: { label: video.name },
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      type: 'default'
    }))

    const choiceEdges: Edge[] = project.choices.map(choice => ({
      id: choice.id,
      source: choice.sourceVideoId,
      target: choice.targetVideoId,
      label: choice.options.join(' / '),
      type: 'step'
    }))

    setNodes(videoNodes)
    setEdges(choiceEdges)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestor de Cine Interactivo</h1>
      
      <div className="flex justify-between mb-4">
        <Button onClick={() => setIsNewProjectDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Proyecto
        </Button>
      </div>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList>
          <TabsTrigger value="projects">Proyectos</TabsTrigger>
          <TabsTrigger value="videos" disabled={!selectedProject}>Videos</TabsTrigger>
          <TabsTrigger value="choices" disabled={!selectedProject}>Bifurcaciones</TabsTrigger>
          <TabsTrigger value="flowchart" disabled={!selectedProject}>Diagrama de Flujo</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <Card key={project.id} className="cursor-pointer" onClick={() => {
                setSelectedProject(project)
                updateFlowChart(project)
              }}>
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>{project.videos.length} videos, {project.choices.length} bifurcaciones</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="videos">
          {selectedProject && (
            <>
              <Button onClick={() => setIsNewVideoDialogOpen(true)} className="mb-4">
                <Upload className="mr-2 h-4 w-4" /> Cargar Video
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedProject.videos.map(video => (
                  <Card key={video.id} className="cursor-pointer" onClick={() => setSelectedVideo(video)}>
                    <CardHeader>
                      <CardTitle>{video.name}</CardTitle>
                      <CardDescription>
                        {selectedProject.choices.filter(c => c.sourceVideoId === video.id).length} bifurcaciones
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <video src={video.url} className="w-full" controls />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="choices">
          {selectedProject && (
            <>
              <Button onClick={() => setIsNewChoiceDialogOpen(true)} className="mb-4">
                <Plus className="mr-2 h-4 w-4" /> Nueva Bifurcación
              </Button>
              <div className="space-y-4">
                {selectedProject.choices.map((choice) => (
                  <Card key={choice.id}>
                    <CardHeader>
                      <CardTitle>Bifurcación en {choice.time} segundos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Opciones: {choice.options.join(', ')}</p>
                      <p>Video origen: {selectedProject.videos.find(v => v.id === choice.sourceVideoId)?.name}</p>
                      <p>Video destino: {selectedProject.videos.find(v => v.id === choice.targetVideoId)?.name}</p>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Trash className="mr-2 h-4 w-4" /> Eliminar
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="flowchart">
          {selectedProject && (
            <div style={{ width: '100%', height: '500px' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
              >
                <Controls />
                <Background />
              </ReactFlow>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project-name" className="text-right">
                Nombre
              </Label>
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateProject}>Crear Proyecto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewVideoDialogOpen} onOpenChange={setIsNewVideoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cargar Nuevo Video</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="video-name" className="text-right">
                Nombre
              </Label>
              <Input
                id="video-name"
                value={newVideoName}
                onChange={(e) => setNewVideoName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="video-file" className="text-right">
                Archivo
              </Label>
              <Input
                id="video-file"
                type="file"
                accept="video/*"
                onChange={(e) => setNewVideoFile(e.target.files?.[0] || null)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateVideo}>Cargar Video</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewChoiceDialogOpen} onOpenChange={setIsNewChoiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Bifurcación</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="choice-time" className="text-right">
                Tiempo (s)
              </Label>
              <Input
                id="choice-time"
                type="number"
                value={newChoiceTime}
                onChange={(e) => setNewChoiceTime(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="choice-option-1" className="text-right">
                Opción 1
              </Label>
              <Input
                id="choice-option-1"
                value={newChoiceOptions[0]}
                onChange={(e) => setNewChoiceOptions([e.target.value, newChoiceOptions[1]])}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="choice-option-2" className="text-right">
                Opción 2
              </Label>
              <Input
                id="choice-option-2"
                value={newChoiceOptions[1]}
                onChange={(e) => setNewChoiceOptions([newChoiceOptions[0], e.target.value])}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="target-video" className="text-right">
                Video Destino
              </Label>
              <select
                id="target-video"
                value={newChoiceTargetVideoId}
                onChange={(e) => setNewChoiceTargetVideoId(e.target.value)}
                className="col-span-3"
              >
                <option value="">Seleccionar video</option>
                {selectedProject?.videos.map(video => (
                  <option key={video.id} value={video.id}>{video.name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateChoice}>Crear Bifurcación</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}