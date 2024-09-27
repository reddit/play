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

export interface PlayProject {
  /** readonly */
  id?: string | undefined
  name: string
  /** readonly */
  createdAt?: Date | undefined
  /** readonly */
  updatedAt?: Date | undefined
  /** t2_ id of the user who created a note */
  authorId?: string | undefined
  files: PlayProjectFile[]
}

export interface PlayProjectFile {
  /** readonly */
  id?: string | undefined
  name: string
  content: Uint8Array
  /** readonly */
  createdAt?: Date | undefined
  /** readonly */
  updatedAt?: Date | undefined
}
