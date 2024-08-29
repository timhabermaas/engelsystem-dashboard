import { Chip, DefaultMantineColor, Group } from "@mantine/core";
import { colorForId } from "~/utils";

interface ShiftTypeFilterProps {
  values: { id: number; name: string }[];
  selected: Set<number>;
  onChange: (id: number, checked: boolean) => void;
  /** If not set the color will be determined according to the id */
  color?: DefaultMantineColor | undefined;
}

export function ShiftTypeFilter(props: ShiftTypeFilterProps) {
  return (
    <Group gap="xs" align="center">
      {props.values.map((st) => (
        <Chip
          checked={props.selected.has(st.id)}
          variant="light"
          radius="xl"
          size="sm"
          color={props.color ?? colorForId(st.id)}
          key={st.id}
          onChange={(checked) => props.onChange(st.id, checked)}
        >
          {st.name}
        </Chip>
      ))}
    </Group>
  );
}
