import type { PlayProject } from "@devvit/protos/community.js";
import type { ProjectStorageClient } from "./project-storage-client.js";

const SESSION_PROJECT_ID = 'SESSION_PROJECT_ID';

/**
 * Operator for saving and loading projects. Handles logic for when and how to save.
 *
 * The underlying storage mechanism is abstracted away by the injected storage client.
 */
export class ProjectSave {
  private projectStorageClient: ProjectStorageClient;
  private currentProject: PlayProject | undefined;

  constructor(projectStorageClient: ProjectStorageClient) {
    this.projectStorageClient = projectStorageClient;

    const restoredProjectStr = globalThis.sessionStorage.getItem(SESSION_PROJECT_ID);
    if (restoredProjectStr) {
      try {
        this.currentProject = JSON.parse(restoredProjectStr);
      } catch (e) {
        // fall-through --- invalid data, just ignore it.
      }
    }
  }
  
  getCurrentProject(): PlayProject | undefined {
    return this.currentProject;
  }

  async saveProject(name: string, src: string): Promise<void> {
    let project = this.getCurrentProject();
    if (project === undefined) {
      project = await this.projectStorageClient.CreateProject(name);
    }

    project.files = [{name: 'main.tsx', content: new TextEncoder().encode(src)}];
    project.updatedAt = new Date();
    await this.projectStorageClient.UpdateProject(project);

    // Store the project in memory and in sessionStorage
    this.setCurrentProject(project)
  }

  async getProjectList(): Promise<PlayProject[]> {
    return this.projectStorageClient.ListProjects();
  }

  async loadProject(id: string): Promise<PlayProject> {
    const project = await this.projectStorageClient.GetProject(id);
    this.setCurrentProject(project)
    return project;
  }

  clearCurrentProject(): void {
    this.setCurrentProject(undefined);
  }

  private setCurrentProject(project: PlayProject | undefined): void {
    this.currentProject = project;
    if (project) {
      globalThis.sessionStorage.setItem(SESSION_PROJECT_ID, JSON.stringify(project));
    } else {
      globalThis.sessionStorage.removeItem(SESSION_PROJECT_ID);
    }
  }
}
