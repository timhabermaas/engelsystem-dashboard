import { RangeSlider } from "@mantine/core";
import {
  addHours,
  differenceInHours,
  eachDayOfInterval,
  format,
  roundToNearestHours,
} from "date-fns";

interface TimespanSliderProps {
  start: Date;
  end: Date;

  onChangeEnd?: (value: [Date, Date]) => void;
}

export function TimespanSlider(props: TimespanSliderProps) {
  const flooredStart = roundToNearestHours(props.start, {
    roundingMethod: "floor",
  });
  const ceiledEnd = roundToNearestHours(props.end, {
    roundingMethod: "ceil",
  });

  const diffHours = differenceInHours(ceiledEnd, flooredStart);

  const formatter = (hours: number) => {
    const date = addHours(flooredStart, hours);
    return format(date, "EEEE H:mm");
  };

  const marks = eachDayOfInterval({ start: flooredStart, end: ceiledEnd }).map(
    (d) => {
      return {
        value: differenceInHours(d, flooredStart),
        label: format(d, "EEEEEE"),
      };
    }
  );

  return (
    <RangeSlider
      onChangeEnd={(v) => {
        if (props.onChangeEnd) {
          props.onChangeEnd([
            addHours(flooredStart, v[0]),
            addHours(flooredStart, v[1]),
          ]);
        }
      }}
      color="blue"
      marks={marks}
      min={0}
      max={diffHours}
      step={1}
      minRange={12}
      label={formatter}
    />
  );
}
