import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../../../../store/auth.store';
import { ProctorService } from '../../../../services/proctor.service';
import { Violation } from '../../../../types';
import { io, Socket } from 'socket.io-client';
import { Camera, AlertTriangle, User as UserIcon, Calendar, ShieldAlert, AlertCircle } from 'lucide-react';

interface ActiveSession {
  attemptId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  examId: string;
  examName: string;
  startedAt: string;
  violationCount: number;
  liveImage?: string; // base64 snapshot
}

export const AdminProctoringPage: React.FC = () => {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [alerts, setAlerts] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);

  // 1. Initial fetch of active sessions & violation history logs
  useEffect(() => {
    const fetchActiveSessions = async () => {
      try {
        const liveData = await ProctorService.getLiveSessions();
        setSessions(liveData);

        const logs = await ProctorService.getLogs();
        setAlerts(logs.slice(0, 15)); // top 15 logs
      } catch (err: any) {
        console.error('Error fetching proctor data:', err);
        setError('Failed to fetch live proctor parameters.');
      } finally {
        setLoading(false);
      }
    };
    fetchActiveSessions();
  }, []);

  // 2. Setup Sockets listeners
  useEffect(() => {
    if (loading || error) return;

    const socketUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : 'http://localhost:5000';
    
    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.emit('join', {
      userId: user?.id,
      role: user?.role,
    });

    // Student starts exam session
    socket.on('student-joined', (data: any) => {
      setSessions((prev) => {
        const exists = prev.some((s) => s.attemptId === data.attemptId);
        if (exists) return prev;
        
        return [
          ...prev,
          {
            attemptId: data.attemptId,
            studentId: data.studentId,
            studentName: data.studentName,
            rollNumber: data.rollNumber || 'N/A',
            examId: data.examId,
            examName: data.examName || 'Assessment',
            startedAt: new Date().toISOString(),
            violationCount: 0,
          },
        ];
      });
    });

    // Student closes or disconnects socket
    socket.on('student-left', (data: { attemptId: string; studentName: string }) => {
      setSessions((prev) => prev.filter((s) => s.attemptId !== data.attemptId));
    });

    // Student streams base64 snapshot feed
    socket.on('live-snapshot', (data: { attemptId: string; image: string }) => {
      setSessions((prev) =>
        prev.map((s) => (s.attemptId === data.attemptId ? { ...s, liveImage: data.image } : s))
      );
    });

    // Violation alert broadcast
    socket.on('violation-alert', (violation: any) => {
      // Add to sidebar alert feed
      setAlerts((prev) => [violation, ...prev].slice(0, 20));

      // Increment warning count in active grid
      setSessions((prev) =>
        prev.map((s) =>
          s.attemptId === violation.attemptId
            ? { ...s, violationCount: violation.totalViolations || s.violationCount + 1 }
            : s
        )
      );

      // Play alert noise if possible
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, audioContext.currentTime); // Low warning sound
        gain.gain.setValueAtTime(0.08, audioContext.currentTime);
        osc.start();
        osc.stop(audioContext.currentTime + 0.15);
      } catch (soundErr) {
        // silent catch
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [loading, error, user]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <span className="text-xs text-muted-foreground font-medium">Opening Live Socket channels...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Live Proctoring Panel</h1>
        <p className="text-xs text-[#8e919e] mt-1">
          Monitor active examinations. Real-time video snapshots and screen visibility anomalies are broadcasted instantly.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Main split viewport layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Active students feeds list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#8e919e] uppercase tracking-wider">
              Active Candidates ({sessions.length})
            </h3>
            <span className="text-[10px] font-semibold text-success animate-pulse bg-success/5 border border-success/15 py-0.5 px-2.5 rounded-full uppercase">
              Websocket Link Engaged
            </span>
          </div>

          {sessions.length === 0 ? (
            <div className="py-20 border border-dashed border-card-border rounded-3xl flex flex-col items-center gap-3 text-center bg-card">
              <Camera size={32} className="text-muted-foreground" />
              <h3 className="font-bold text-sm text-foreground">No Active Sessions</h3>
              <p className="text-xs text-[#8e919e]">There are no students attempting examinations right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {sessions.map((sess) => {
                const isHighViolations = sess.violationCount >= 5;

                return (
                  <div
                    key={sess.attemptId}
                    className={`bg-card border rounded-2xl p-4 flex flex-col gap-3.5 shadow-md hover:scale-[1.01] transition-transform ${
                      isHighViolations ? 'border-destructive/35' : 'border-card-border'
                    }`}
                  >
                    {/* Live webcam window */}
                    <div className="aspect-video bg-black rounded-xl border border-white/[0.04] relative overflow-hidden flex items-center justify-center">
                      {sess.liveImage ? (
                        <img
                          src={sess.liveImage}
                          alt={`${sess.studentName} feed`}
                          className="w-full h-full object-cover scale-x-[-1]" // Mirrored snapshot
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground">
                          <Camera size={20} className="text-[#8e919e] animate-pulse" />
                          <span>Connecting Stream...</span>
                        </div>
                      )}

                      <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[9px] font-semibold text-success border border-success/20">
                        LIVE FEED
                      </div>

                      {sess.violationCount > 0 && (
                        <div className="absolute bottom-2 left-2 bg-destructive border border-destructive/20 text-white text-[9px] font-bold py-0.5 px-2 rounded flex items-center gap-1">
                          <AlertTriangle size={10} /> {sess.violationCount} FLAGS
                        </div>
                      )}
                    </div>

                    {/* Metadata details */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground block truncate max-w-[150px]">{sess.studentName}</span>
                        <span className="text-[10px] text-muted-foreground font-mono font-semibold">{sess.rollNumber}</span>
                      </div>
                      <span className="text-[#8e919e] block truncate">{sess.examName}</span>
                      <span className="text-[10px] text-muted-foreground block">
                        Started: {new Date(sess.startedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Scrolling violation feed panel */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-[#8e919e] uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert size={16} className="text-indigo-400" /> Recent Violation Feed
          </h3>

          <div className="bg-card border border-card-border p-5 rounded-2xl max-h-[70vh] overflow-y-auto space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground">
                No violation incidents recorded yet in logs.
              </div>
            ) : (
              <div className="space-y-3.5">
                {alerts.map((alert, index) => {
                  const timeStr = new Date(alert.timestamp).toLocaleTimeString();
                  const isCritical = alert.riskScore >= 15;

                  return (
                    <div
                      key={alert.id || index}
                      className="p-3 bg-white/[0.01] border border-white/5 rounded-xl text-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="font-bold text-foreground block">{alert.studentName || 'Student'}</span>
                          <span className="text-[9px] text-[#8e919e] block truncate max-w-[170px]">
                            {alert.examName || 'Examination'}
                          </span>
                        </div>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[8px] font-bold border shrink-0 ${
                            isCritical
                              ? 'bg-destructive/10 text-destructive border-destructive/20 font-extrabold'
                              : 'bg-warning/10 text-warning border-warning/20'
                          }`}
                        >
                          Risk +{alert.riskScore}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[#8e919e]">
                        <span className="font-semibold text-foreground">{alert.type.replace('_', ' ')}</span>
                        <span>{timeStr}</span>
                      </div>

                      {alert.screenshotUrl && (
                        <div className="pt-1">
                          <a
                            href={alert.screenshotUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-indigo-400 hover:underline font-semibold block bg-white/[0.02] border border-white/5 rounded p-1.5 text-center"
                          >
                            👁️ View Evidence Snapshot
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
export default AdminProctoringPage;
