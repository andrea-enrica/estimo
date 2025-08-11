import {Typography} from "antd";
import {Pie} from "@ant-design/plots";
import {StoryDto} from "../../../utils/dtos/StoryDto";

interface StoryCardWithPieChartProps {
  story: StoryDto;
  voteCounts: Record<string, number>;
}

export default function StoryCardWithPieChart({
  story,
  voteCounts
}: StoryCardWithPieChartProps) {
  const pieData = Object.entries(voteCounts).map(([voteType, count]) => ({
    type: voteType,
    value: count
  }));

  const chartConfig = {
    data: pieData,
    angleField: "value",
    colorField: "type",
    color: ["#108ee9", "#87d068"],
    innerRadius: 0.6,
    height: 250,

    label: {
      text: "type",
      style: {
        fontWeight: "bold"
      }
    }
  };

  return (
    <>
      <Typography.Title style={{color: "#395a6d"}} level={2}>{story.title}</Typography.Title>

      <Typography.Title style={{color: "#395a6d"}}  level={4}>Average: {story.average}</Typography.Title>
      <div className="pie">
        <Pie {...chartConfig} />
      </div>

      <br></br>
    </>
  );
}
