import useNotification from "antd/es/notification/useNotification";

type NotificatonType = "success" | "info" | "warning" | "error";
type PositionType =
  | "top"
  | "topLeft"
  | "topRight"
  | "bottom"
  | "bottomLeft"
  | "bottomRight"
  | undefined;

const useNotifier = () => {
  const [api, contextHolder] = useNotification();

  const openNotification = (
    type: NotificatonType,
    title: string,
    message: string,
    position: PositionType,
    time?: number,
    onClose?: () => void
  ) => {
    api[type]({
      message: title,
      description: message,
      placement: position,
      duration: time,
      onClose
    });
  };

  const openSuccessNotification = (
    message: string,
    title: string = "Action completed successfully",
    position: PositionType = "topRight",
    time: number = 3,
    onClose?: () => void
  ) => {
    api["success"]({
      message: title,
      description: message,
      placement: position,
      duration: time,
      onClose
    });
  };

  const openErrorNotification = (
    message: string,
    title: string = "Oops, something went wrong...",
    position: PositionType = "topRight",
    time: number = 3,
    onClose?: () => void
  ) => {
    api["error"]({
      message: title,
      description: `An error occured while trying to apply your changes, please try again. ${
        message ? message : ""
      }`,
      placement: position,
      duration: time,
      onClose
    });
  };

  return {
    openNotification,
    openSuccessNotification,
    openErrorNotification,
    contextHolder
  };
};

export default useNotifier;
