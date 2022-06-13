import { useMemo, useRef, useEffect } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

export const useYdoc = () => {
  const isFirstLoad = useRef(true);
  const ydoc = useMemo(() => new Y.Doc(), []);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
    } else {
      new WebrtcProvider('konva', ydoc);
    }
  }, [ydoc]);

  return { ydoc } as const;
};
