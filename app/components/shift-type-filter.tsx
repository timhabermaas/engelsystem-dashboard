import { Chip, Group } from "@mantine/core";
import { colorForName } from "~/utils";

interface ShiftTypeFilterProps {
  shiftTypes: { id: number; name: string }[];
  selected: Set<number>;
  onChange: (id: number, checked: boolean) => void;
}

export function ShiftTypeFilter(props: ShiftTypeFilterProps) {
  return (
    <Group gap="xs" align="center">
      {props.shiftTypes.map((st) => (
        <Chip
          checked={props.selected.has(st.id)}
          variant="light"
          radius="xl"
          size="sm"
          color={colorForName(st.name)}
          key={st.id}
          onChange={(checked) => props.onChange(st.id, checked)}
        >
          {st.name}
        </Chip>
      ))}
    </Group>
  );
}
