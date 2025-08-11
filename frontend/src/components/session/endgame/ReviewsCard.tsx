import {Card, Col, Divider, Rate, Row} from "antd";
import {FrownOutlined, MehOutlined, SmileOutlined} from "@ant-design/icons";

import Meta from "antd/es/card/Meta";
import {useEffect, useState} from "react";
import {UserSessionDetailsDto} from "../../../utils/dtos/UserSessionDetailsDto";
import {useGetUserSessionDetailsBySessionIdQuery} from "../../../api/UserSessionApi";
import {useGetSimpleUsersInSessionQuery} from "../../../api/UserApi";
import {SimpleUserDto} from "../../../utils/dtos/SimpleUserDto";

interface IOwnProps {
  sessionId: number;
}

export default function ReviewsCard(props: IOwnProps) {
  const { sessionId } = props;
  const { data: simpleUser } = useGetSimpleUsersInSessionQuery({ sessionId });
  const { data: userSession } = useGetUserSessionDetailsBySessionIdQuery({
    sessionId
  });

  const [usersSession, setUsersSession] = useState<UserSessionDetailsDto[]>([]);
  const [simpleUsers, setSimpleUsers] = useState<SimpleUserDto[]>([]);
  const [rating, setRating] = useState<number>(0);

  const calculateRating = () => {
    var sum = 0;
    for (const user of usersSession) {
      sum += user.rating;
    }
    setRating(sum / usersSession.length);
  };

  useEffect(() => {
    if (userSession) {
      setUsersSession(userSession);
    }
    if (simpleUser) {
      setSimpleUsers(simpleUser);
    }
    calculateRating();
  }, [userSession, simpleUsers, calculateRating, rating, simpleUser]);

  const customIcons: Record<number, React.ReactNode> = {
    1: <FrownOutlined />,
    2: <FrownOutlined />,
    3: <MehOutlined />,
    4: <SmileOutlined />,
    5: <SmileOutlined />
  };

  return (
    <Card className="end-game-cards end-game-card-review">
      <Meta
        title={
          <span className="card-title">{isNaN(rating) ? "0" : rating}</span>
        }
        description={
          <Rate
            className="reviews-rating"
            disabled
            defaultValue={0}
            value={isNaN(rating) ? 0 : rating}
            character={({ index = 0 }) => customIcons[index + 1]}
          />
        }
      />
      <Divider />
      <div className="reviews">
        {usersSession.map((user, index) => {
          const userName = simpleUsers.find((u) => u.id === user.id.userId);
          return (
            <div key={user.id.userId}>
              <Row gutter={[10, 8]} align="top">
                <Col flex={2}>
                  <Row className="reviews-username">
                    {userName ? userName.username : "Player"}
                  </Row>
                  <Row>
                    <Rate
                      className="reviews-rating"
                      disabled
                      defaultValue={0}
                      value={user.rating}
                      character={({ index = 0 }) => customIcons[index + 1]}
                    />
                  </Row>
                </Col>
              </Row>
              <Row>
                <div className="review-feedback">
                  {user.feedback ? user.feedback : "No answer..."}
                </div>
              </Row>
              <Divider />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
