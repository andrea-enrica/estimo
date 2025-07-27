import { Card, Progress, Flex } from "antd";
import { useGetEstimationPercentInSessionStoriesQuery } from "../../../api/UserStoryApi";
import Meta from "antd/es/card/Meta";

interface IOwnProps {
  sessionId: number;
}

export default function EstimationStatisticsCard(props: IOwnProps) {
  const { sessionId } = props;
  const { data: estimationStories } =
    useGetEstimationPercentInSessionStoriesQuery({ sessionId });
  const progressList = estimationStories ? estimationStories : [];
  return (
    <Card className="end-game-cards statistics-card">
      <Meta
        title="Estimation Statistics"
        description="Voted percentage of connected users per story"
      />
      <br></br>
      <Flex gap="small" vertical>
        {progressList.map((item) => (
          <div key={item.title} style={{ marginBottom: "10px" }}>
            <span style={{ marginRight: "10px", fontWeight: "bold" }}>
              {item.title}
            </span>
            <Progress percent={item.percent} />
          </div>
        ))}
      </Flex>
    </Card>
  );
}
