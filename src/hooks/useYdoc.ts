import { useMemo, useRef, useEffect } from 'react';
import * as Y from 'yjs';
import * as awarenessProtocol from 'y-protocols/awareness.js';
import { WebrtcProvider } from 'y-webrtc';

export const useYdoc = () => {
  const isFirstLoad = useRef(true);
  const ydoc = useMemo(() => new Y.Doc(), []);

  useEffect(() => {
    if (isFirstLoad.current) {
      const provider = new WebrtcProvider('konva', ydoc, {
        // signaling: ['ws://localhost:9080'],
        signaling: ['ws://localhost:9080'],
        // signaling: ['ws://localhost:5555'],
        // signaling: ['ws://localhost:4444'],
        password: null,
        awareness: new awarenessProtocol.Awareness(ydoc),
        maxConns: 20 + Math.floor(Math.random() * 15),
        filterBcConns: true,
        peerOpts: {
          config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] },
        },
      });

      provider.on('synced', (synced: any) => {
        console.log('synced!', synced);
      });

      isFirstLoad.current = false;
    }
  }, [ydoc]);

  return { ydoc } as const;
};
