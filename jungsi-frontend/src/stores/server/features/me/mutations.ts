import { createMutation } from "../../common-utils";
import { IEditLifeRecordBody, IEditProfileBody } from "./interfaces";

/**
 * 프로필 수정
 */
export const useEditProfile = () => {
  return createMutation<IEditProfileBody, void>("PATCH", "/members/profile");
};

export const useEditLifeRecord = () => {
  return createMutation<IEditLifeRecordBody, void>(
    "PATCH",
    "/members/life-record",
  );
};
