import { memo } from 'react';
import { Circle, Group, Text } from 'react-konva';

type GroupProps = React.ComponentProps<typeof Group>;

export const Cursor = memo((props: GroupProps) => {
  return (
    <Group {...props}>
      <Text text={`${props.id}`} offsetX={-5} offsetY={20} fill="red" />
      <Circle radius={5} fill="red" />
    </Group>
  );
});
