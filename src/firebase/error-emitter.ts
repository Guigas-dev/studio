'use client';

/**
 * Emissor de eventos simples para uso no cliente, evitando dependência direta
 * do módulo 'events' do Node.js que pode causar erros em bundlers modernos.
 */
type Callback = (data: any) => void;

class SimpleEventEmitter {
  private listeners: { [key: string]: Callback[] } = {};

  on(event: string, callback: Callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback: Callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: string, data: any) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(cb => cb(data));
  }
}

export const errorEmitter = new SimpleEventEmitter();
