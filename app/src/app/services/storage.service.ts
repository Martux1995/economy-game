import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }


  async saveStorage( save, type: string ) { // Guardar en el storage
    const saved = await localStorage.setItem( type , save );
    return saved;

  }

  async getStorage( type: string ) { // Obtener del storage 
    const saved = await localStorage.getItem( type ) || null;
    return saved;
  }

  async clearStorage() { // Borrar el storage
    await localStorage.clear();
  }

  async removeStorage( borrar: string ) { // Remover item del storage
    await localStorage.removeItem( borrar );
  }
}
