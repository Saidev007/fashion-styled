import type { GalleryPhoto } from './types'
const DB_NAME = 'forme-magic-gallery'
const STORE = 'photos'
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('This browser does not support a local photo gallery.'))
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: 'id' }) }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error('The local photo gallery could not be opened.'))
  })
}
async function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore, resolve: (value: T) => void, reject: (error: Error) => void) => void): Promise<T> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => { const tx = db.transaction(STORE, mode); run(tx.objectStore(STORE), resolve, reject); tx.oncomplete = () => db.close(); tx.onerror = () => { db.close(); reject(new Error('The gallery storage operation failed.')) }; tx.onabort = () => { db.close(); reject(new Error('The gallery storage operation was interrupted.')) } })
}
export const listPhotos = () => withStore<GalleryPhoto[]>('readonly', (store, resolve, reject) => { const request = store.getAll(); request.onsuccess = () => resolve((request.result as GalleryPhoto[]).sort((a,b) => b.createdAt-a.createdAt)); request.onerror = () => reject(new Error('Saved photos could not be loaded.')) })
export const getPhoto = (id: string) => withStore<GalleryPhoto | undefined>('readonly', (store, resolve, reject) => { const request = store.get(id); request.onsuccess = () => resolve(request.result as GalleryPhoto | undefined); request.onerror = () => reject(new Error('This photo could not be opened.')) })
export const savePhoto = (photo: GalleryPhoto) => withStore<void>('readwrite', (store, resolve, reject) => { const request = store.put(photo); request.onsuccess = () => resolve(); request.onerror = () => reject(new Error('Your browser could not save this photo. Check available storage.')) })
export const deletePhoto = (id: string) => withStore<void>('readwrite', (store, resolve, reject) => { const request = store.delete(id); request.onsuccess = () => resolve(); request.onerror = () => reject(new Error('This photo could not be deleted.')) })
export const clearPhotos = () => withStore<void>('readwrite', (store, resolve, reject) => { const request = store.clear(); request.onsuccess = () => resolve(); request.onerror = () => reject(new Error('The gallery could not be cleared.')) })
