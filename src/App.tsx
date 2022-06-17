import { useRef, useEffect, memo, useCallback } from 'react';
import './App.css';
import { Stage, Layer, Rect, Text, Circle } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { useYcanvas } from './hooks/useYcanvas';
import { Shape } from 'konva/lib/Shape';
import Konva from 'konva';
import * as Y from 'yjs';
import { useYdoc } from './hooks/useYdoc';
import { useYcursor } from './hooks/useYcursor';

type RectProps = React.ComponentProps<typeof Rect>;
type CircleProps = React.ComponentProps<typeof Circle>;

const MemoRect = memo((props: RectProps) => <Rect {...props} />);
const MemoCircle = memo((props: CircleProps) => <Circle {...props} />);

const App = () => {
  const { ydoc } = useYdoc();
  const yRootMap = ydoc.getMap('root');
  const undoManager = new Y.UndoManager(yRootMap, {
    trackedOrigins: new Set(['move-rect']),
  });

  const stageRef = useRef<Konva.Stage>(null);
  const { rects, dragStartCanvas, dragMove, dragEndCanvas } =
    useYcanvas(yRootMap);
  const { cursors, moveCursor } = useYcursor(yRootMap);

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) =>
    moveCursor(e.evt.x, e.evt.y);

  const handleDragStart = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      if (e.target instanceof Shape) dragStartCanvas(e.target);
    },
    [dragStartCanvas]
  );

  const handleDragMove = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      if (e.target instanceof Shape) {
        moveCursor(e.evt.x, e.evt.y);
        dragMove(e.target);
      }
    },
    [dragMove, moveCursor]
  );

  const handleDragEnd = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      if (e.target instanceof Shape) dragEndCanvas(e.target);
    },
    [dragEndCanvas]
  );

  const undo = () => undoManager.undo();

  const redo = () => undoManager.redo();

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'z' && e.metaKey) {
      e.shiftKey ? redo() : undo();
    }
    e.stopPropagation();
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseMove={handleMouseMove}
    >
      <Layer>
        <Text text="Try to drag a rect" />
        {rects.map((rect) => (
          <MemoRect
            key={rect.id}
            id={rect.id}
            x={rect.x}
            y={rect.y}
            height={rect.height}
            width={rect.width}
            fill="#89b717"
            draggable
            shadowColor="black"
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragMove={handleDragMove}
          />
        ))}

        {cursors.map((cursor) => (
          <MemoCircle
            key={cursor.id}
            x={cursor.x}
            y={cursor.y}
            radius={5}
            fill="red"
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default App;
