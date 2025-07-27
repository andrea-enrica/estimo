import { Card, Carousel, Spin } from "antd";
import { useEffect, useState } from "react";
import { useGetStoriesBySessionIdQuery } from "../../../api/StoryApi";
import StoryCardWithPieChart from "./StoryCardWithPieChart";
import { StoryDto } from "../../../utils/dtos/StoryDto";
import { useGetUserStoriesBySessionIdQuery } from "../../../api/UserStoryApi";
import { UserStoryDetailsDto } from "../../../utils/dtos/UserStoryDetailsDto";

interface IOwnProps {
  sessionId: number;
}

export default function EstimationListCard(props: IOwnProps) {
  const { sessionId } = props;
  const { data: sessionStories, isLoading: storiesLoading } =
    useGetStoriesBySessionIdQuery({ sessionId });
  const [stories, setStories] = useState<StoryDto[]>([]);
  const { data: userStories, isLoading: userStoriesLoading } =
    useGetUserStoriesBySessionIdQuery({
      sessionId
    });
  const [userStoryDetails, setUserStoryDetails] = useState<
    UserStoryDetailsDto[]
  >([]);

  useEffect(() => {
    if (sessionStories && !storiesLoading) {
      setStories(sessionStories);
    }
    if (userStories && !userStoriesLoading) {
      setUserStoryDetails(userStories);
    }
  }, [sessionStories, userStories, storiesLoading, userStoriesLoading]);

  const computeVoteCounts = (story: StoryDto): Record<string, number> => {
    const counts: Record<string, number> = {};

    const filteredDetails = userStoryDetails.filter(
      (detail) => detail.id.storyId === story.key
    );

    filteredDetails.forEach((detail) => {
      const estimation = detail.estimation || "?";
      counts[estimation] = (counts[estimation] || 0) + 1;
    });

    return counts;
  };

  if (storiesLoading || userStoriesLoading) {
    return <Spin size="large" />;
  }

  return (
    <Card
      className="end-game-cards estimation-list-card"
      title="User Estimations"
    >
      <Carousel arrows infinite={false}>
        {stories.map((story) => {
          const voteCounts = computeVoteCounts(story);
          return (
            <div key={story.key} className="carousel">
              {Object.keys(voteCounts).length > 0 ? (
                <StoryCardWithPieChart story={story} voteCounts={voteCounts} />
              ) : (
                <p>No votes available for this story.</p>
              )}
            </div>
          );
        })}
      </Carousel>
    </Card>
  );
}
