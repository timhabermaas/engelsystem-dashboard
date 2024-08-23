import {
  CheckIcon,
  Combobox,
  Group,
  Pill,
  PillsInput,
  useCombobox,
} from "@mantine/core";
import { useEffect, useState } from "react";

interface SearchableMultiSelectProps {
  options: [string, string][];
  onChangeOptions: (selectedItems: string[]) => void;
}

export function SearchableMultiSelect(props: SearchableMultiSelectProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
  });

  const optionsMap = new Map(props.options);

  const [search, setSearch] = useState("");
  const [value, setValue] = useState<string[]>([]);

  const handleValueSelect = (val: string) => {
    setValue((current) =>
      current.includes(val)
        ? current.filter((v) => v !== val)
        : [...current, val]
    );
    setSearch("");
    combobox.closeDropdown();
  };

  useEffect(() => {
    props.onChangeOptions(value);
  }, [value.join(",")]);

  const handleValueRemove = (val: string) =>
    setValue((current) => current.filter((v) => v !== val));

  const values = value.map((id) => (
    <Pill key={id} withRemoveButton onRemove={() => handleValueRemove(id)}>
      👤 {optionsMap.get(id)}
    </Pill>
  ));

  const filteredOptions = props.options
    .filter(([_id, item]) =>
      item.toLowerCase().includes(search.trim().toLowerCase())
    )
    .map(([id, item]) => (
      <Combobox.Option value={id} key={id} active={value.includes(id)}>
        <Group gap="sm">
          {value.includes(id) ? <CheckIcon size={12} /> : null}
          <span>👤 {item}</span>
        </Group>
      </Combobox.Option>
    ));

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={handleValueSelect}
      withinPortal={false}
    >
      <Combobox.DropdownTarget>
        <PillsInput onClick={() => combobox.openDropdown()}>
          <Pill.Group>
            {values}

            <Combobox.EventsTarget>
              <PillsInput.Field
                onFocus={() => combobox.openDropdown()}
                onBlur={() => combobox.closeDropdown()}
                value={search}
                placeholder="Search users"
                onChange={(event) => {
                  combobox.openDropdown();
                  combobox.updateSelectedOptionIndex();
                  setSearch(event.currentTarget.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Backspace" && search.length === 0) {
                    event.preventDefault();
                    handleValueRemove(value[value.length - 1]);
                  }
                }}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Combobox.Options>
          {filteredOptions.length > 0 ? (
            filteredOptions
          ) : (
            <Combobox.Empty>Nothing found...</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
