/** Settings state for un/packing to/from LocalStorage. Not shareable. */
export type SettingsSave = {
  /** Most recent console open state. */
  openConsole: boolean
  useExperimentalBlocks: boolean
  /** Enable local runtime. Execute apps locally whenever possible. */
  useLocalRuntime: boolean
  /** Enable remote runtime. Upload often and execute apps remotely as needed. */
  useRemoteRuntime: boolean
  /** Probably the devenv compute address. Eg, http://localhost:7777. */
  remoteRuntimeOrigin: string
  /**
   * Settings version recorded at save time. Used for unpacking old data if
   * structural changes have been made. Independent of package.json version.
   */
  version: 1
}

const storageKey = 'playSettings'

export const defaultSettings: Readonly<SettingsSave> = {
  openConsole: false,
  useExperimentalBlocks: false,
  useLocalRuntime: true,
  useRemoteRuntime: false,
  remoteRuntimeOrigin: 'http://localhost:7777',
  version: 1
}

export function loadSettings(
  storage: Readonly<Storage>
): SettingsSave | undefined {
  return settingsFromJSON(storage.getItem(storageKey) ?? '')
}

export function saveSettings(
  storage: Readonly<Storage>,
  settings: Readonly<SettingsSave>
): void {
  storage.setItem(storageKey, JSON.stringify(settings))
}

function settingsFromJSON(json: string): SettingsSave | undefined {
  let settings
  try {
    settings = JSON.parse(json)
  } catch {
    return
  }
  if (!settings || settings.version !== 1) return
  return settings // Assume LocalStorage is valid.
}
