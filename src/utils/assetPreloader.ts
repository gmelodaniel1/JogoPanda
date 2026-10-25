import { DialogueNode, DialogueScript } from '../types/dialogue';
import {
  getBackgroundFallbackPath,
  getBackgroundPath,
  getFallbackSpritePath,
  getSpritePath,
} from './assetHelper';

/**
 * Gerenciador de Preload e Cache Preditivo de Assets
 * Pré-carrega sprites de personagens e cenários dos próximos nós da árvore de diálogo
 * utilizando a API img.decode() para decodificação assíncrona fora da thread principal.
 * Elimina o efeito FOUC (Flash of Unstyled Content) e atrasos de carregamento em redes lentas.
 */
class AssetPreloader {
  private loadedUrls = new Set<string>();
  private failedUrls = new Set<string>();
  private inFlight = new Map<string, Promise<boolean>>();
  private imageCache = new Map<string, HTMLImageElement>();
  private maxCacheSize = 60; // Mantém até 60 imagens decodificadas na memória RAM do browser

  /**
   * Verifica se a URL já foi carregada e decodificada com sucesso na sessão
   */
  public isLoaded(url: string | null | undefined): boolean {
    if (!url) return false;
    return this.loadedUrls.has(url);
  }

  /**
   * Verifica se a URL falhou (ex.: arquivo não existe) para aplicar fallback sem aguardar timeout
   */
  public isFailed(url: string | null | undefined): boolean {
    if (!url) return false;
    return this.failedUrls.has(url);
  }

  /**
   * Pré-carrega e decodifica uma imagem em segundo plano
   */
  public preloadImage(url: string | null | undefined): Promise<boolean> {
    if (!url || typeof window === 'undefined' || typeof Image === 'undefined') {
      return Promise.resolve(false);
    }

    if (this.loadedUrls.has(url)) return Promise.resolve(true);
    if (this.failedUrls.has(url)) return Promise.resolve(false);
    if (this.inFlight.has(url)) return this.inFlight.get(url)!;

    const promise = new Promise<boolean>((resolve) => {
      const img = new Image();
      img.src = url;

      const finish = (success: boolean) => {
        this.inFlight.delete(url);
        if (success) {
          this.loadedUrls.add(url);
          this.failedUrls.delete(url);
          this.imageCache.set(url, img);

          // Limita o tamanho do cache para não consumir RAM excessiva em aparelhos móveis
          if (this.imageCache.size > this.maxCacheSize) {
            const oldestKey = this.imageCache.keys().next().value;
            if (oldestKey) this.imageCache.delete(oldestKey);
          }
        } else {
          this.failedUrls.add(url);
        }
        resolve(success);
      };

      // Usa a API decode() moderna quando disponível para decodificar na GPU sem travar o loop de render
      if ('decode' in img && typeof img.decode === 'function') {
        img
          .decode()
          .then(() => finish(true))
          .catch(() => {
            img.onload = () => finish(true);
            img.onerror = () => finish(false);
          });
      } else {
        img.onload = () => finish(true);
        img.onerror = () => finish(false);
      }
    });

    this.inFlight.set(url, promise);
    return promise;
  }

  /**
   * Pré-carrega todos os assets visuais associados a um nó específico
   */
  public preloadNodeAssets(node: DialogueNode | null | undefined): void {
    if (!node) return;

    // Cenários
    if (node.background) {
      const bgUrl = getBackgroundPath(node.background);
      this.preloadImage(bgUrl);
      const bgFallback = getBackgroundFallbackPath(node.background);
      if (bgFallback && bgFallback !== bgUrl) {
        this.preloadImage(bgFallback);
      }
    }

    // Sprite Primário
    if (node.sprite) {
      const spriteUrl = getSpritePath(node.sprite.characterId, node.sprite.expression);
      this.preloadImage(spriteUrl);
      const spriteFallback = getFallbackSpritePath(node.sprite.characterId, node.sprite.expression);
      if (spriteFallback && spriteFallback !== spriteUrl) {
        this.preloadImage(spriteFallback);
      }
    }

    // Sprite Secundário
    if (node.secondarySprite) {
      const secUrl = getSpritePath(node.secondarySprite.characterId, node.secondarySprite.expression);
      this.preloadImage(secUrl);
      const secFallback = getFallbackSpritePath(node.secondarySprite.characterId, node.secondarySprite.expression);
      if (secFallback && secFallback !== secUrl) {
        this.preloadImage(secFallback);
      }
    }
  }

  /**
   * Pré-carrega preditivamente os nós subsequentes até uma profundidade determinada (padrão: 2 passos à frente)
   */
  public preloadUpcomingNodes(script: DialogueScript, currentNodeId: string, depth = 2): void {
    if (!script || !script.nodes || typeof window === 'undefined') return;

    const visited = new Set<string>();
    const queue: { id: string; currentDepth: number }[] = [];

    const current = script.nodes[currentNodeId];
    if (!current) return;

    // Adiciona filhos diretos
    if (current.nextNodeId) {
      queue.push({ id: current.nextNodeId, currentDepth: 1 });
    }
    if (current.choices) {
      for (const choice of current.choices) {
        if (choice.nextNodeId) {
          queue.push({ id: choice.nextNodeId, currentDepth: 1 });
        }
      }
    }

    while (queue.length > 0) {
      const item = queue.shift();
      if (!item || visited.has(item.id)) continue;
      visited.add(item.id);

      const node = script.nodes[item.id];
      if (!node) continue;

      this.preloadNodeAssets(node);

      // Expande até o limite de profundidade
      if (item.currentDepth < depth) {
        if (node.nextNodeId && !visited.has(node.nextNodeId)) {
          queue.push({ id: node.nextNodeId, currentDepth: item.currentDepth + 1 });
        }
        if (node.choices) {
          for (const choice of node.choices) {
            if (choice.nextNodeId && !visited.has(choice.nextNodeId)) {
              queue.push({ id: choice.nextNodeId, currentDepth: item.currentDepth + 1 });
            }
          }
        }
      }
    }
  }

  /**
   * Reseta o estado do cache em testes ou recarregamento forçado
   */
  public clear(): void {
    this.loadedUrls.clear();
    this.failedUrls.clear();
    this.inFlight.clear();
    this.imageCache.clear();
  }
}

export const assetPreloader = new AssetPreloader();
