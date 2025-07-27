import { Button, Form, Input, Spin } from "antd";
import { LoginCredentialsDto } from "../utils/dtos/LoginCredentialsDto";
import { useLoginUserMutation } from "../api/UserApi";
import { LocalStorageProperties } from "../utils/Enums";
import { useLocation, useNavigate } from "react-router-dom";
import estimoLogo from "../images/estimoLogo.png";
import "../styles/Header.css";
import "../styles/Login.css";
import { AuthInfoDto } from "../utils/dtos/AuthInfoDto";
import {
  clearAuthenticatedUserData,
  getAuthenticatedUserClaim
} from "../services/AuthService";
import useNotifier from "./hooks/useNotifier";
import { useEffect } from "react";
import { RoutePaths } from "../utils/constants/RoutePaths";

export default function LoginPage() {
  const [form] = Form.useForm();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const { openNotification, contextHolder } = useNotifier();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const redirected = params.get("redirected");

    if (redirected) {
      openNotification(
        "warning",
        "You have been redirected",
        "Your current session expired, please log in again.",
        "top",
        3
      );
    }
  });

  const handleOnFormSubmit = (value: LoginCredentialsDto) => {
    clearAuthenticatedUserData();
    const loginCredentials: LoginCredentialsDto = {
      credential: value.credential,
      password: value.password
    };

    loginUser({ loginCredentials: loginCredentials })
      .unwrap()
      .then((payload: AuthInfoDto) => {
        const username = payload.userDetails.username;
        navigate(RoutePaths.ADMIN_USER_MANAGER_HOME, {
          state: { showWelcomeNotification: true, username: username }
        });
      })
      .catch((error: any) => {
        const errorMessage = error?.data?.message || error?.error;
        openNotification(
          "error",
          "Invalid login attempt!",
          `An issue occurred when attempting to log you in: ${errorMessage}. Please try again.`,
          "top",
          2
        );
      });
  };

  return (
    <>
      {contextHolder}
      <div className="login-container-wrapper">
        {isLoading && (
          <div className="spin-overlay">
            <Spin size="large" />
          </div>
        )}
        <div className="login-background" />
        <div className="login-container">
          <div className="login-content">
            <div className="login-image"></div>
            <div className="login-form-container">
              <Form
                id="loginForm"
                form={form}
                onFinish={handleOnFormSubmit}
                className="login-form"
                layout="vertical"
              >
                <div className="logo-style-login">
                  <img
                    className="login-header-image"
                    src={estimoLogo}
                    alt="Estimo logo"
                  />
                </div>
                <br />

                <Form.Item
                  label="Username/Email:"
                  name="credential"
                  rules={[
                    {
                      required: true,
                      message: "Please input your username or email address!"
                    }
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Password:"
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: "Please input your password!"
                    }
                  ]}
                >
                  <Input.Password placeholder="Password" autoComplete="true" />
                </Form.Item>
                <Button
                  className="login-button"
                  key="submit"
                  type="primary"
                  htmlType="submit"
                  form="loginForm"
                >
                  Log in
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
