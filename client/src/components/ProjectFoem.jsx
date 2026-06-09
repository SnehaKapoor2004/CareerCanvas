import React from 'react'
import { Plus, Trash2 } from 'lucide-react'

const ProjectForm = ({ data = [], OnChange }) => {

  const addProject = () => {
    const newProject = {
      name: '',
      type: '',
      description: '',
    }
    OnChange([...data, newProject])
  }

  const removeProject = (index) => {
    const updated = data.filter((_, i) => i !== index)
    OnChange(updated)
  }

  const updateProject = (index, field, value) => {
    const updated = [...data]
    updated[index] = { ...updated[index], [field]: value }
    OnChange(updated)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
          <p className="text-sm text-gray-500">Add your projects here</p>
        </div>
        <button
          onClick={addProject}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
        >
          <Plus className="size-4" />
          Add Project
        </button>
      </div>

      <div className="space-y-4">
        {data.length === 0 ? (
          <p className="text-sm text-gray-400 text-center">
            No projects added yet
          </p>
        ) : (
          data.map((project, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-start">
                <h4>Project #{index + 1}</h4>
                <button
                  onClick={() => removeProject(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <input
                  value={project.name}
                  onChange={(e) =>
                    updateProject(index, 'name', e.target.value)
                  }
                  type="text"
                  placeholder="Project Name"
                  className="px-3 py-2 text-sm rounded-lg border"
                />

                <input
                  value={project.type}
                  onChange={(e) =>
                    updateProject(index, 'type', e.target.value)
                  }
                  type="text"
                  placeholder="Project Type"
                  className="px-3 py-2 text-sm rounded-lg border"
                />

                <textarea
                  rows={4}
                  value={project.description}
                  onChange={(e) =>
                    updateProject(index, 'description', e.target.value)
                  }
                  placeholder="Describe your project..."
                  className="md:col-span-2 px-3 py-2 text-sm rounded-lg border resize-none"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ProjectForm
