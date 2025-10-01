import { Injectable } from '@nestjs/common';

@Injectable()
export class ServerStatusService {
  private status = {
    uptime: 0,
    onlineUsers: 0,
    message: 'Server is starting...',
  };

  getStatus() {
    return this.status;
  }

  updateStatus(data: { uptime?: number; onlineUsers?: number; message?: string }) {
    if (data.uptime !== undefined) {
      this.status.uptime = data.uptime;
    }
    if (data.onlineUsers !== undefined) {
      this.status.onlineUsers = data.onlineUsers;
    }
    if (data.message !== undefined) {
      this.status.message = data.message;
    }

    return this.status;
  }
}
