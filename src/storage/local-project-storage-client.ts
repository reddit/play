// Implementation of ProjectStorageClient backed by IndexedDB,
// for storing play project data and files locally in the browser.
//
// This is fairly primitive, and doesn't bother with relational data ---
// it simply stores the entire Project objects, ProjectFiles attached.

import type { ProjectStorageClient } from './project-storage-client.js';

import { PlayProject } from '@devvit/protos/community.js';

const DB_NAME = 'PlayProjectDB';
const DB_VERSION = 1;
const PROJECT_STORE = 'projects';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PROJECT_STORE)) {
        db.createObjectStore(PROJECT_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/** Browser-local implementation of ProjectStorageClient. */
export class LocalProjectStorageClient implements ProjectStorageClient {
  async CreateProject(name: string): Promise<PlayProject> {
    const db = await openDB();
    const transaction = db.transaction([PROJECT_STORE], 'readwrite');
    const store = transaction.objectStore(PROJECT_STORE);

    const id = crypto.randomUUID();
    const project: PlayProject = {
      id,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      authorId: '',
      files: [],
    };

    return new Promise((resolve, reject) => {
      const request = store.add(project);
      request.onsuccess = () => {
        resolve(project);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async UpdateProject(project: PlayProject): Promise<void> {
    const db = await openDB();
    const transaction = db.transaction([PROJECT_STORE], 'readwrite');
    const store = transaction.objectStore(PROJECT_STORE);

    project.updatedAt = new Date();

    return new Promise((resolve, reject) => {
      const request = store.put(project);
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async GetProject(id: string): Promise<PlayProject> {
    const db = await openDB();
    const transaction = db.transaction([PROJECT_STORE], 'readonly');
    const store = transaction.objectStore(PROJECT_STORE);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
        } else {
          reject(new Error('Project not found'));
        }
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async ListProjects(): Promise<PlayProject[]> {
    const db = await openDB();
    const transaction = db.transaction([PROJECT_STORE], 'readonly');
    const store = transaction.objectStore(PROJECT_STORE);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}
