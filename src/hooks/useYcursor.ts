import * as Y from 'yjs';
import UUID from 'uuidjs';
import { useState, useEffect, useCallback } from 'react';
import Konva from 'konva';

type Cursor = {
  id: string;
  x: number;
  y: number;
};

const current: Cursor = {
  id: UUID.generate(),
  x: 0,
  y: 0,
};

export const useYcursor = (
  yRootMap: Y.Map<unknown>,
) => {
  const ydoc = yRootMap.doc;
  const [cursors, setCursors] = useState<Cursor[]>([]);

  const moveCursor = useCallback((x: number, y: number) => {
    ydoc?.transact(() => {
      const yCursors = yRootMap.get('cursors') as Y.Array<Cursor>;
      yCursors?.push([{ ...current, x, y }]);
    });
  }, [yRootMap, ydoc]);

  const hasChangeCursors = (event: Y.YEvent<any>) => event.path.join() === 'cursors'

  yRootMap?.observeDeep((events) => {
    events.forEach((event) => {
      if ((event.target instanceof Y.Array<Cursor>) && hasChangeCursors(event)) {
        const yCursors = event.target
        const cursors = yCursors.toArray()

        ydoc?.transact(() => {
        const uniqueIds = new Set();
          for (let i = cursors.length - 1; i >= 0; i--) {
            const item = cursors[i];
            uniqueIds.has(item.id) ? yCursors.delete(i, 1) : uniqueIds.add(item.id);
          }
        })

        setCursors(yCursors.toArray().filter((cursor) => cursor.id !== current.id));
      }
    })
  });

  useEffect(() => {
    yRootMap.set('cursors', new Y.Array<Cursor>());
  }, [yRootMap]);


  return { cursors, moveCursor };
};
