import { useState, useCallback, useEffect } from 'react';
import * as Y from 'yjs';
import { Shape } from 'konva/lib/Shape';

type Rect = {
  id: string;
  x: number;
  y: number;
  height: number;
  width: number;
};

const generateShapes = (): Rect[] =>
  [...Array(1000)].map((_, i) => ({
    id: i.toString(),
    // x: Math.random() * window.innerWidth,
    // y: Math.random() * window.innerHeight,
    x: i * 10,
    y: i * 10,
    height: 50,
    width: 50,
  }));

const INITIAL_STATE = generateShapes();

export const useYcanvas = (yRootMap: Y.Map<unknown>) => {
  const ydoc = yRootMap.doc;
  const [rects, setRects] = useState<Rect[]>(INITIAL_STATE);

  const dragStartCanvas = useCallback((target: Shape) => {
    const id = target.id();
    setRects((rects) =>
      rects.map((rect) => ({
        ...rect,
        isDragging: rect.id === id,
      }))
    );
  }, []);

  const updateYRect = (target: Shape) => {
    ydoc?.transact(() => {
      const yRects = yRootMap.get('rects') as Y.Array<Rect>
      const newRects = yRects.map((rect) =>
        rect.id === target.id() ? { ...rect, x: target.x(), y: target.y()} : rect
      )
      yRects.delete(0, yRects.length)
      yRects.push(newRects)
    }, 'move-rect')
  }

  const dragMove = useCallback(updateYRect, [yRootMap, ydoc]);

  const dragEndCanvas = useCallback(updateYRect, [yRootMap, ydoc]);

  const hasChangeRects = (event: Y.YEvent<any>) => event.path.join() === 'rects'

  yRootMap.observeDeep((events) => {
    events.forEach((event) => {
      if ((event.target instanceof Y.Array<Rect>) && hasChangeRects(event)) {
        setRects(event.target.toArray());
      }
    })
  });

  useEffect(() => {
    const yRects = new Y.Array<Rect>();

    yRootMap.set('rects', yRects);
    yRects.push(INITIAL_STATE)
  }, [yRootMap]);

  return { rects, dragStartCanvas, dragMove, dragEndCanvas } as const;
};
