import { useState, useRef, useEffect } from "react";
import { Modal, Form, Input, Button, Select } from "antd";
import { SelectProps } from "antd/lib/select";
import "../../styles/User.css";
import { SessionDto } from "../../utils/dtos/SessionDto";
import { format } from "date-fns";
import { valueTypeOptions } from "../../utils/ValueTypes";
import {
  customValuesFibonacci,
  customValuesHours,
  customValuesScrum,
  customValuesSequential,
  customValuesTshirt
} from "../../utils/CustomValues";
import { SessionStatus, UserRole, ValueTypesEnum } from "../../utils/Enums";
import { useGetManagersQuery } from "../../api/UserApi";
import { UserProfileDto } from "../../utils/dtos/UserProfileDto";
import { useSaveSessionMutation } from "../../api/SessionApi";
import CustomValuesContainer from "./CustomValuesContainer";
import { AppstoreAddOutlined } from "@ant-design/icons";
import CreateStoryModal from "../story/CreateStoryModal";
import { CreateStoryDto } from "../../utils/dtos/CreateStoryDto";
import { useCreateStoryMutation } from "../../api/StoryApi";
import useNotifier from "../hooks/useNotifier";

interface IOwnProps {
  onOk: (session: SessionDto) => void;
  onClose: () => void;
  creatorId: number;
  userDetails: UserProfileDto;
}

export default function CreateSessionModal(props: IOwnProps) {
  const { onOk, onClose, creatorId, userDetails } = props;
  const [form] = Form.useForm();

  const [customValues, setCustomValues] = useState<SelectProps["options"]>([]);
  const [submitCustomValues, setSubmitCustomValues] = useState<
    SelectProps["options"]
  >([]);
  const [valueType, setValueType] = useState<string>(ValueTypesEnum.Scrum);
  const { data: sessionManagers = [] } = useGetManagersQuery();
  const [addSession] = useSaveSessionMutation();
  const authUserRole = userDetails.role;
  const authUserId = Number(userDetails.id);

  const sessionManagersOptions = sessionManagers.map((manager) => ({
    label: manager.fullName,
    value: manager.id
  }));
  const sessionManagerIdRef = useRef<number>(1);
  const customValuesString = useRef<string>("");
  const defaultCustomValuesString = useRef<string>("");

  useEffect(() => {
    const customValuesVal = customValues?.map((val) => val.value);
    defaultCustomValuesString.current = customValuesVal
      ? customValuesVal.join(";")
      : "";
  }, [customValues]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      form.resetFields();

      const finalCustomValues = customValuesString.current.length
        ? customValuesString.current
        : defaultCustomValuesString.current;

      const sessionData: SessionDto = {
        ...values,
        customValues: finalCustomValues,
        valueType: valueType,
        status: SessionStatus.IDLE,
        dateCreated: format(Date.now(), "yyyy-MM-dd HH:mm:ss"),
        creatorId: creatorId,
        sessionManagerId:
          authUserRole === UserRole.MANAGER
            ? authUserId
            : sessionManagerIdRef.current
      };

      onOk(sessionData);
      onClose();
    });
  };

  const handleSessionManagerChange = (value: number) => {
    sessionManagerIdRef.current = value;
  };

  const handleValueTypeChange = (value: string) => {
    setValueType(value);

    switch (value) {
      case ValueTypesEnum.Fibonacci:
        setCustomValues(customValuesFibonacci);
        break;
      case ValueTypesEnum.Scrum:
        setCustomValues(customValuesScrum);
        break;
      case ValueTypesEnum.Tshirt:
        setCustomValues(customValuesTshirt);
        break;
      case ValueTypesEnum.Sequential:
        setCustomValues(customValuesSequential);
        break;
      case ValueTypesEnum.Hours:
        setCustomValues(customValuesHours);
        break;
      default:
        setCustomValues(customValuesScrum);
    }
    const customValuesVal = customValues?.map((val) => val.value);
    customValuesString.current = customValuesVal
      ? customValuesVal.join(";")
      : "";
  };

  const onCustomValuesChange = (checkedValues: any) => {
    customValuesString.current = checkedValues
      .map((val: { value: any }) => val.value)
      .join(";");
    setSubmitCustomValues(checkedValues);
  };

  return (
    <Modal
      centered
      title="Create a Voting Session"
      open={true}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose} shape="round">
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          className="primary-button"
          htmlType="submit"
          form="createSessionForm"
        >
          Submit
        </Button>
      ]}
    >
      <Form
        id="createSessionForm"
        form={form}
        layout="vertical"
        onFinish={handleOk}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Please input the title!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Voting system"
          name="valueType"
          rules={[
            { required: true, message: "Please select the voting system!" }
          ]}
        >
          <Select
            options={valueTypeOptions}
            value={valueType}
            onChange={handleValueTypeChange}
          />
        </Form.Item>
        <Form.Item>
          <CustomValuesContainer
            allCustomValues={customValues}
            givenCheckedCustomValues={submitCustomValues}
            onCustomValuesChange={onCustomValuesChange}
          />
        </Form.Item>
        <Form.Item
          label="Session manager"
          name="sessionManagerFullName"
          rules={
            authUserRole === UserRole.MANAGER
              ? []
              : [
                  {
                    required: true,
                    message: "Please select the session manager!"
                  }
                ]
          }
        >
          <Select
            defaultValue={
              authUserRole === UserRole.MANAGER ? authUserId : undefined
            }
            options={sessionManagersOptions}
            onChange={handleSessionManagerChange}
            disabled={authUserRole === UserRole.MANAGER}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
