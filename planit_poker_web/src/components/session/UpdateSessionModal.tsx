import { Button, Form, Input, Modal } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import "../../styles/User.css";
import { SessionDto } from "../../utils/dtos/SessionDto";
import CustomValuesContainer from "../session/CustomValuesContainer";
import { useRef, useState } from "react";
import { SelectProps } from "antd/lib";

import {
  findCustomValues,
  mapCustomValuesToOptions
} from "../../services/SessionService";

interface IOwnProps {
  onUpdateOk: (sessionId: number, title: string, customValues: string) => void;
  onClose: () => void;
  currentSelectedSession: SessionDto;
}

interface FormItemIndexes {
  title: string;
}

export default function UpdateSessionModal(props: IOwnProps) {
  const { onUpdateOk, onClose, currentSelectedSession } = props;

  const [form] = Form.useForm();
  const customValuesString = useRef<string>("");
  const [allCustomValues] = useState<SelectProps["options"]>([]);

  const handleOnSubmit = (formItems: FormItemIndexes) => {
    form.validateFields();

    onUpdateOk(
      currentSelectedSession.id,
      formItems.title,
      customValuesString.current
    );
    onClose();
  };

  const onCustomValuesChange = (checkedValues: any) => {
    customValuesString.current = checkedValues
      .map((val: { value: any }) => val.value)
      .join(";");
  };

  return (
    <Modal
      centered
      title={<div className="session-update-modal-title">Session Title:</div>}
      open={true}
      onCancel={onClose}
      footer={[
        <Button
          className="custom-button"
          key="Cancel"
          type="default"
          onClick={onClose}
          shape="round"
        >
          Cancel
        </Button>,
        <Button
          key="submit"
          htmlType="submit"
          type="primary"
          form="myForm"
          className="custom-button primary-button"
          icon={<SaveOutlined />}
        >
          Save
        </Button>
      ]}
    >
      <Form id="myForm" onFinish={handleOnSubmit} form={form} layout="vertical">
        <Form.Item
          name="title"
          rules={[
            {
              required: true,
              message: "Please input a title for your session!"
            }
          ]}
          initialValue={currentSelectedSession.title}
          required={true}
        >
          <Input className="title-input" />
        </Form.Item>

        <Form.Item
          name="customValues"
          initialValue={allCustomValues}
          required={true}
        >
          <CustomValuesContainer
            allCustomValues={findCustomValues(currentSelectedSession.valueType)}
            givenCheckedCustomValues={mapCustomValuesToOptions(
              currentSelectedSession.customValues
            )}
            onCustomValuesChange={onCustomValuesChange}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
