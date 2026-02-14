import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getProjects, createProject, updateProject, enableProject, disableProject } from '@/api/projects'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref([])
  const loading = ref(false)
  const currentProject = ref(null)

  async function fetchProjects(filters = {}) {
    loading.value = true
    try {
      const data = await getProjects(filters)
      projects.value = data
      return data
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function addProject(projectData) {
    loading.value = true
    try {
      const newProject = await createProject(projectData)
      projects.value.push(newProject)
      return newProject
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function editProject(id, projectData) {
    loading.value = true
    try {
      const updatedProject = await updateProject(id, projectData)
      const index = projects.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }
      return updatedProject
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function disableProjectById(id) {
    loading.value = true
    try {
      await disableProject(id)
      const project = projects.value.find((p) => p.id === id)
      if (project) {
        project.disabled = true
      }
    } catch (error) {
      console.error('Erreur lors de la désactivation du projet:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function enableProjectById(id) {
    loading.value = true
    try {
      await enableProject(id)
      const project = projects.value.find((p) => p.id === id)
      if (project) {
        project.disabled = false
      }
    } catch (error) {
      console.error('Erreur lors de l\'activation du projet:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  function getActiveProjects() {
    return projects.value.filter((p) => !p.disabled)
  }

  return {
    projects,
    loading,
    currentProject,
    fetchProjects,
    addProject,
    editProject,
    disableProjectById,
    enableProjectById,
    getActiveProjects,
  }
})
