import type { GalleryPhoto } from './types'
const DB_NAME = 'forme-magic-gallery'
const STORE = 'photos'
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('This browser does not support a local photo gallery.'))
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: 'id' }) }
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close()
      resolve(request.result)
    }
    request.onerror = () => reject(new Error('The local photo gallery could not be opened.'))
    request.onblocked = () => reject(new Error('The local photo gallery is busy in another tab. Close the other tab and try again.'))
  })
}
async function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore, resolve: (value: T) => void, reject: (error: Error) => void) => void): Promise<T> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    let result: T
    let hasResult = false
    let settled = false
    const tx = db.transaction(STORE, mode)
    const finish = (error?: Error) => {
      if (settled) return
      settled = true
      db.close()
      if (error) reject(error)
      else if (hasResult) resolve(result)
      else reject(new Error('The gallery storage operation did not complete.'))
    }
    tx.oncomplete = () => finish()
    tx.onerror = () => finish(new Error('The gallery storage operation failed.'))
    tx.onabort = () => finish(new Error('The gallery storage operation was interrupted.'))
    try {
      run(tx.objectStore(STORE), value => { result = value; hasResult = true }, error => finish(error))
    } catch {
      tx.abort()
      finish(new Error('The gallery storage operation could not be started.'))
    }
  })
}
export const listPhotos = () => withStore<GalleryPhoto[]>('readonly', (store, resolve, reject) => { const request = store.getAll(); request.onsuccess = () => resolve((request.result as GalleryPhoto[]).sort((a,b) => b.createdAt-a.createdAt)); request.onerror = () => reject(new Error('Saved photos could not be loaded.')) })
export const getPhoto = (id: string) => withStore<GalleryPhoto | undefined>('readonly', (store, resolve, reject) => { const request = store.get(id); request.onsuccess = () => resolve(request.result as GalleryPhoto | undefined); request.onerror = () => reject(new Error('This photo could not be opened.')) })
export const savePhoto = (photo: GalleryPhoto) => withStore<void>('readwrite', (store, resolve, reject) => { const request = store.put(photo); request.onsuccess = () => resolve(); request.onerror = () => reject(new Error('Your browser could not save this photo. Check available storage.')) })
export const deletePhoto = (id: string) => withStore<void>('readwrite', (store, resolve, reject) => { const request = store.delete(id); request.onsuccess = () => resolve(); request.onerror = () => reject(new Error('This photo could not be deleted.')) })
export const clearPhotos = () => withStore<void>('readwrite', (store, resolve, reject) => { const request = store.clear(); request.onsuccess = () => resolve(); request.onerror = () => reject(new Error('The gallery could not be cleared.')) })
