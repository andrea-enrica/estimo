import React, {useState} from "react";
import {Checkbox, CheckboxProps, Collapse, SelectProps} from "antd";
import {DefaultOptionType} from "antd/es/select";
import "../../styles/Session.css";

interface IOwnProps {
  allCustomValues: SelectProps["options"];
  onCustomValuesChange: (checkedValues: any) => void;
  givenCheckedCustomValues: SelectProps["options"];
}

export default function CustomValuesContainer(props: IOwnProps) {
  const { allCustomValues, onCustomValuesChange, givenCheckedCustomValues } =
    props;

  const [customizeChecked, setCustomizeChecked] = useState<boolean>(false);
  const [newCheckedCustomValues, setNewCheckedCustomValues] = useState<
    SelectProps["options"]
  >(givenCheckedCustomValues);
  const [notEnoughValuesSelected, setNotEnoughValuesSelected] =
    useState<boolean>(false);

  const onCustomizeChange: CheckboxProps["onChange"] = (e) => {
    setCustomizeChecked(e.target.checked);
  };

  const addNewCustomValue: CheckboxProps["onChange"] = (e) => {
    if (newCheckedCustomValues) {
      setNotEnoughValuesSelected(false);
      let updatedValues;
      if (e.target.checked) {
        const option = allCustomValues?.find(
          (opt) => opt.value === e.target.value
        );
        if (option) {
          updatedValues = [...newCheckedCustomValues, option];
        }
      } else {
        updatedValues = newCheckedCustomValues.filter(
          (checkedOption) => checkedOption.value !== e.target.value
        );
      }

      setNewCheckedCustomValues(updatedValues);
      const newUpdatedValues = updatedValues;

      if (newUpdatedValues?.length === 0 || newUpdatedValues?.length === 1) {
        onCustomValuesChange(allCustomValues);
        setNotEnoughValuesSelected(true);
      } else onCustomValuesChange(updatedValues);
    }
  };

  const items = [
    {
      key: "1",
      label: "Custom Values",
      children: (
        <>
          <Checkbox onChange={onCustomizeChange}>Customize values</Checkbox>
          {customizeChecked &&
            allCustomValues &&
            allCustomValues.map((option: DefaultOptionType) => (
              <Checkbox
                value={option.value}
                defaultChecked={
                  givenCheckedCustomValues
                    ? givenCheckedCustomValues.some(
                        (checkedOption) => checkedOption.value === option.value
                      )
                    : false
                }
                onChange={addNewCustomValue}
              >
                {option.label}
              </Checkbox>
            ))}
          {notEnoughValuesSelected ? (
            <p className="alert-message">
              Not enough values selected. Will be selected all the possible
              values!
            </p>
          ) : (
            ""
          )}
        </>
      )
    }
  ];

  return (
    <Collapse>
      {items.map((item) => (
        <Collapse.Panel key={item.key} header={item.label}>
          {item.children}
        </Collapse.Panel>
      ))}
    </Collapse>
  );
}
