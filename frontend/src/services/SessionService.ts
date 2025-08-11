import {UserDto} from "../utils/dtos/UserDto";
import {
    customValuesFibonacci,
    customValuesHours,
    customValuesScrum,
    customValuesSequential,
    customValuesTshirt
} from "../utils/CustomValues";
import {ValueTypesEnum} from "../utils/Enums";

export const mapUsersToOptions = (users: UserDto[]) => {
  return users.map((user) => ({
    label: user.username,
    value: user.username
  }));
};

export const mapCustomValuesToOptions = (customValues: string) => {
  return customValues.split(";").map((string, index) => ({
    label: string,
    value: string
  }));
};

export const findCustomValues = (value: string) => {
  switch (value) {
    case ValueTypesEnum.Fibonacci:
      return customValuesFibonacci;
    case ValueTypesEnum.Scrum:
      return customValuesScrum;
    case ValueTypesEnum.Tshirt:
      return customValuesTshirt;
    case ValueTypesEnum.Sequential:
      return customValuesSequential;
    case ValueTypesEnum.Hours:
      return customValuesHours;
    default:
      return customValuesScrum;
  }
};
