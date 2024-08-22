import {PlayProject} from '@devvit/protos/community.js'

/**
 * Interface for a client that can store and retrieve PlayProjects.
 *
 * This can be injected into play-pen to provide a different implementation.
 */
export interface ProjectStorageClient {
  CreateProject(name: string): Promise<PlayProject>
  UpdateProject(project: PlayProject): Promise<void>
  GetProject(id: string): Promise<PlayProject>
  ListProjects(): Promise<PlayProject[]>
}
