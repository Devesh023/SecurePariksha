import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';

let io: SocketServer | null = null;

// Track active student sessions: attemptId -> socketId
const activeSessions = new Map<string, { socketId: string; studentId: string; examId: string; studentName: string }>();

export function initSocket(server: HttpServer) {
  io = new SocketServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join room based on role
    socket.on('join', (data: { userId: string; role: string }) => {
      if (data.role === 'SUPER_ADMIN' || data.role === 'EXAM_ADMIN') {
        socket.join('admins');
        console.log(`Admin joined room: ${socket.id}`);
      }
    });

    // Student starts an exam session
    socket.on('start-session', (data: { attemptId: string; studentId: string; examId: string; studentName: string }) => {
      socket.join(data.attemptId);
      socket.join('students');
      activeSessions.set(data.attemptId, {
        socketId: socket.id,
        studentId: data.studentId,
        examId: data.examId,
        studentName: data.studentName,
      });

      console.log(`Student ${data.studentName} started exam session: ${data.attemptId}`);
      
      // Notify admins of new active session
      io?.to('admins').emit('student-joined', {
        attemptId: data.attemptId,
        studentId: data.studentId,
        examId: data.examId,
        studentName: data.studentName,
        status: 'ACTIVE',
      });
    });

    // Live webcam snapshot feed stream
    socket.on('webcam-snapshot', (data: { attemptId: string; image: string }) => {
      // Broadcast this snapshot to admins looking at this attempt
      io?.to('admins').emit('live-snapshot', {
        attemptId: data.attemptId,
        image: data.image,
      });
    });

    // Student disconnects or explicitly leaves
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      
      // Find session mapped to this socket and remove it
      for (const [attemptId, session] of activeSessions.entries()) {
        if (session.socketId === socket.id) {
          activeSessions.delete(attemptId);
          console.log(`Student session terminated on socket disconnect: ${attemptId}`);
          
          io?.to('admins').emit('student-left', {
            attemptId,
            studentName: session.studentName,
          });
          break;
        }
      }
    });
  });

  return io;
}

// Global broadcasting helper for violations
export function notifyViolation(violation: any) {
  if (io) {
    io.to('admins').emit('violation-alert', violation);
    console.log(`[Socket] Broadcasted violation alert for attempt ${violation.attemptId}`);
  }
}

// Helper to get active exam sessions list
export function getActiveSessionsList() {
  return Array.from(activeSessions.entries()).map(([attemptId, session]) => ({
    attemptId,
    studentId: session.studentId,
    examId: session.examId,
    studentName: session.studentName,
  }));
}
