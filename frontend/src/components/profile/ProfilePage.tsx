import React, {useState} from "react";
import {LocalStorageProperties, UserRole} from "../../utils/Enums";
import ProfileModal from "./ProfileModal";
import EditProfileModal from "./EditProfileModal";
import "../../styles/Profile.css";
import {UserDto} from "../../utils/dtos/UserDto";
import {useEditUserMutation, useGetUserProfileQuery} from "../../api/UserApi";
import {getAuthenticatedUserClaim} from "../../services/AuthService";
import useNotifier from "../hooks/useNotifier";
import {UserProfileDto} from "../../utils/dtos/UserProfileDto";

interface IOwnProps {
  onClose: () => void;
}

export interface ProfileProps {
  id: number;
  username: string;
  password: string;
  role: UserRole;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
}

export default function ProfilePage(props: IOwnProps) {
  const { onClose } = props;
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const { openNotification, contextHolder } = useNotifier();

  const [editUser] = useEditUserMutation();
  const { data: userDetails } = useGetUserProfileQuery({
    userId: Number(getAuthenticatedUserClaim(LocalStorageProperties.id))
  });

  const toggleEditModal = () => {
    setIsEditModalVisible(!isEditModalVisible);
  };

  const handleEditOk = (updatedUser: UserDto) => {
    if (userDetails) {
      editUser({ userId: Number(userDetails.id), newUser: updatedUser })
        .unwrap()
        .then((updatedUserProfile: UserProfileDto) => {
          openNotification(
            "success",
            "Profile Updated!",
            `Your profile has been successfully updated!`,
            "top",
            3
          );
        })
        .catch((error: any) => {
          const errorMessage = error?.data?.message || error?.error;
          openNotification(
            "error",
            "Profile Update Failed!",
            `An issue occurred when attempting to update your profile: ${errorMessage}. Please try again.`,
            "top",
            3
          );
        });
    }
    setIsEditModalVisible(false);
  };

  return (
    <>
      {contextHolder}
      {userDetails ? (
        <>
          <ProfileModal
            visible={true}
            userDetails={userDetails}
            onEdit={toggleEditModal}
            onClose={onClose}
          />

          {isEditModalVisible && (
            <EditProfileModal
              visible={isEditModalVisible}
              userDetails={userDetails}
              onOk={handleEditOk}
              onCancel={toggleEditModal}
            />
          )}
        </>
      ) : (
        <div>No user found </div>
      )}
    </>
  );
}
