import { Button, Flex } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import "../../../styles/EndGame.css";
import EstimationStatisticsCard from "./EstimationStatisticsCard";
import EstimationListCard from "./EstimationListCard";
import ReviewsCard from "./ReviewsCard";
import { useGetSessionQuery } from "../../../api/SessionApi";
import { SessionStatus } from "../../../utils/Enums";
import { RoutePaths } from "../../../utils/constants/RoutePaths";
import { HomeOutlined } from "@ant-design/icons";
export default function StatisticEndGame() {
  const { id } = useParams();
  const { data: session } = useGetSessionQuery(Number(id));
  const navigate = useNavigate();
  return (
    <>
      {session?.status === SessionStatus.ENDED ? (
        <div className="statistic-end-game-container">
          <h1 className="page-title">Session Statistics Overview</h1>
          <Button
            icon={<HomeOutlined />}
            type="primary"
            onClick={() => {
              navigate(RoutePaths.ADMIN_USER_MANAGER_HOME);
            }}
          >
            Back to home page
          </Button>
          <Flex
            className="statistic-end-game-flex"
            gap="10%"
            justify="center"
            align="center"
          >
            <ReviewsCard sessionId={Number(id)} />
            <EstimationListCard sessionId={Number(id)} />
            <EstimationStatisticsCard sessionId={Number(id)} />
          </Flex>
        </div>
      ) : (
        <div>
          <h2>Session has not ended yet.</h2>
        </div>
      )}
    </>
  );
}
