/**
 * WebSocket视频播放器工具类
 * 用于通过WebSocket连接播放视频流
 */

export interface WebSocketPlayerConfig {
  url: string;
  videoElement: HTMLVideoElement;
  onConnected?: () => void;
  onError?: (error: string) => void;
  onDisconnected?: () => void;
}

export class WebSocketPlayer {
  private websocket: WebSocket | null = null;
  private mediaSource: MediaSource | null = null;
  private sourceBuffer: SourceBuffer | null = null;
  private videoElement: HTMLVideoElement;
  private config: WebSocketPlayerConfig;
  private isConnected = false;
  private bufferCleanupTimer: number | null = null;
  private readonly MAX_BUFFER_SIZE = 30; // 最大缓冲时长（秒）
  private readonly CLEANUP_INTERVAL = 5000; // 清理间隔（毫秒）

  constructor(config: WebSocketPlayerConfig) {
    this.config = config;
    this.videoElement = config.videoElement;
  }

  /**
   * 连接WebSocket并开始播放
   */
  async connect(): Promise<void> {
    try {
      // 检查浏览器支持
      if (!window.MediaSource) {
        throw new Error('浏览器不支持MediaSource API');
      }

      // 创建MediaSource
      this.mediaSource = new MediaSource();
      this.videoElement.src = URL.createObjectURL(this.mediaSource);

      // 等待MediaSource打开
      await new Promise<void>((resolve, reject) => {
        this.mediaSource!.addEventListener('sourceopen', () => {
          try {
            // 创建SourceBuffer
            this.sourceBuffer = this.mediaSource!.addSourceBuffer('video/mp4; codecs="avc1.42E01E,mp4a.40.2"');
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });

      // 创建WebSocket连接
      this.websocket = new WebSocket(this.config.url);
      this.websocket.binaryType = 'arraybuffer';

      this.websocket.onopen = () => {
        console.log('WebSocket连接已建立');
        this.isConnected = true;
        this.startBufferCleanup();
        this.config.onConnected?.();
      };

      this.websocket.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer && this.sourceBuffer) {
          try {
            if (!this.sourceBuffer.updating) {
              // 检查缓冲区大小，防止过度积累
              this.checkBufferHealth();
              this.sourceBuffer.appendBuffer(event.data);
            } else {
              // 如果SourceBuffer正在更新，稍后重试
              setTimeout(() => {
                if (this.sourceBuffer && !this.sourceBuffer.updating) {
                  this.sourceBuffer.appendBuffer(event.data);
                }
              }, 10);
            }
          } catch (error) {
            console.error('添加视频数据失败:', error);
            // 如果添加失败，尝试清理缓存后重试
            this.cleanupBuffer();
          }
        }
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket错误:', error);
        this.config.onError?.('WebSocket连接错误');
      };

      this.websocket.onclose = () => {
        console.log('WebSocket连接已关闭');
        this.isConnected = false;
        this.config.onDisconnected?.();
      };

    } catch (error) {
      console.error('WebSocket播放器初始化失败:', error);
      this.config.onError?.(error instanceof Error ? error.message : '初始化失败');
    }
  }

  /**
   * 开始播放
   */
  play(): void {
    if (this.videoElement) {
      this.videoElement.play().catch(error => {
        console.error('视频播放失败:', error);
        this.config.onError?.('视频播放失败');
      });
    }
  }

  /**
   * 暂停播放
   */
  pause(): void {
    if (this.videoElement) {
      this.videoElement.pause();
    }
  }

  /**
   * 断开连接并清理资源
   */
  disconnect(): void {
    this.stopBufferCleanup();
    
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    if (this.sourceBuffer) {
      try {
        if (!this.sourceBuffer.updating) {
          this.mediaSource?.removeSourceBuffer(this.sourceBuffer);
        }
      } catch (error) {
        console.warn('移除SourceBuffer失败:', error);
      }
      this.sourceBuffer = null;
    }

    if (this.mediaSource) {
      try {
        if (this.mediaSource.readyState === 'open') {
          this.mediaSource.endOfStream();
        }
      } catch (error) {
        console.warn('关闭MediaSource失败:', error);
      }
      this.mediaSource = null;
    }

    if (this.videoElement) {
      this.videoElement.src = '';
      this.videoElement.load();
    }

    this.isConnected = false;
  }

  /**
   * 启动缓存清理定时器
   */
  private startBufferCleanup(): void {
    this.stopBufferCleanup();
    this.bufferCleanupTimer = window.setInterval(() => {
      this.cleanupBuffer();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * 停止缓存清理定时器
   */
  private stopBufferCleanup(): void {
    if (this.bufferCleanupTimer) {
      clearInterval(this.bufferCleanupTimer);
      this.bufferCleanupTimer = null;
    }
  }

  /**
   * 清理过期的缓存数据
   */
  private cleanupBuffer(): void {
    if (!this.sourceBuffer || !this.videoElement || this.sourceBuffer.updating) {
      return;
    }

    try {
      const currentTime = this.videoElement.currentTime;
      const buffered = this.sourceBuffer.buffered;
      
      if (buffered.length > 0) {
        const bufferStart = buffered.start(0);
        const bufferEnd = buffered.end(buffered.length - 1);
        const bufferDuration = bufferEnd - bufferStart;
        
        // 如果缓冲区太大，清理旧数据
        if (bufferDuration > this.MAX_BUFFER_SIZE) {
          const removeEnd = Math.max(bufferStart, currentTime - 10); // 保留当前时间前10秒
          if (removeEnd > bufferStart) {
            console.log(`清理缓存: ${bufferStart.toFixed(2)}s - ${removeEnd.toFixed(2)}s`);
            this.sourceBuffer.remove(bufferStart, removeEnd);
          }
        }
      }
    } catch (error) {
      console.warn('缓存清理失败:', error);
    }
  }

  /**
   * 检查缓冲区健康状态
   */
  private checkBufferHealth(): void {
    if (!this.sourceBuffer || !this.videoElement) {
      return;
    }

    try {
      const buffered = this.sourceBuffer.buffered;
      if (buffered.length > 0) {
        const currentTime = this.videoElement.currentTime;
        const bufferEnd = buffered.end(buffered.length - 1);
        const bufferAhead = bufferEnd - currentTime;
        
        // 如果缓冲区过大，立即清理
        if (bufferAhead > this.MAX_BUFFER_SIZE) {
          console.warn(`缓冲区过大 (${bufferAhead.toFixed(2)}s)，执行清理`);
          this.cleanupBuffer();
        }
      }
    } catch (error) {
      console.warn('缓冲区健康检查失败:', error);
    }
  }

  /**
   * 获取连接状态
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

/**
 * 创建WebSocket播放器实例
 */
export function createWebSocketPlayer(config: WebSocketPlayerConfig): WebSocketPlayer {
  return new WebSocketPlayer(config);
}