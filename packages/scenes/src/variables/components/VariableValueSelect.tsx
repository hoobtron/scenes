import { isArray } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';

import { InputActionMeta, MultiSelect, Select, useStyles2 } from '@grafana/ui';

import { SceneComponentProps } from '../../core/types';
import { MultiValueVariable } from '../variants/MultiValueVariable';
import { VariableValue, VariableValueSingle } from '../types';
import { selectors } from '@grafana/e2e-selectors';
import { css } from '@emotion/css';

export function VariableValueSelect({ model }: SceneComponentProps<MultiValueVariable>) {
  const { value, key } = model.useState();

  const styles = useStyles2(getStyles);
  const onInputChange = model.onSearchChange
    ? (value: string, meta: InputActionMeta) => {
        if (meta.action === 'input-change') {
          model.onSearchChange!(value);
        }
      }
    : undefined;

  return (
    <Select<VariableValue>
      id={key}
      placeholder="Select value"
      width="auto"
      value={value}
      allowCustomValue
      virtualized
      tabSelectsValue={false}
      onInputChange={onInputChange}
      options={model.getOptionsForSelect()}
      data-testid={selectors.pages.Dashboard.SubMenu.submenuItemValueDropDownValueLinkTexts(`${value}`)}
      onChange={(newValue) => {
        model.changeValueTo(newValue.value!, newValue.label!);
      }}
      className={styles.overflow}
    />
  );
}

export function VariableValueSelectMulti({ model }: SceneComponentProps<MultiValueVariable>) {
  const { value, key, maxVisibleValues, noValueOnClear } = model.useState();
  const arrayValue = useMemo(() => (isArray(value) ? value : [value]), [value]);
  const options = model.getOptionsForSelect();

  // To not trigger queries on every selection we store this state locally here and only update the variable onBlur
  const [uncommittedValue, setUncommittedValue] = useState(arrayValue);

  // Detect value changes outside
  useEffect(() => {
    setUncommittedValue(arrayValue);
  }, [arrayValue]);

  const onInputChange = model.onSearchChange
    ? (value: string, meta: InputActionMeta) => {
        if (meta.action === 'input-change') {
          model.onSearchChange!(value);
        }
      }
    : undefined;

  const placeholder = options.length > 0 ? 'Select value' : '';

  const styles = useStyles2(getStyles);

  return (
    <MultiSelect<VariableValueSingle>
      id={key}
      placeholder={placeholder}
      width="auto"
      value={uncommittedValue}
      noMultiValueWrap={true}
      maxVisibleValues={maxVisibleValues ?? 5}
      tabSelectsValue={false}
      virtualized
      allowCustomValue
      options={model.getOptionsForSelect()}
      closeMenuOnSelect={false}
      isClearable={true}
      onInputChange={onInputChange}
      onBlur={() => {
        model.changeValueTo(uncommittedValue);
      }}
      data-testid={selectors.pages.Dashboard.SubMenu.submenuItemValueDropDownValueLinkTexts(`${uncommittedValue}`)}
      onChange={(newValue, action) => {
        if (action.action === 'clear' && noValueOnClear) {
          model.changeValueTo([]);
        }
        setUncommittedValue(newValue.map((x) => x.value!));
      }}
      className={styles.overflow}
    />
  );
}

export function renderSelectForVariable(model: MultiValueVariable) {
  if (model.state.isMulti) {
    return <VariableValueSelectMulti model={model} />;
  } else {
    return <VariableValueSelect model={model} />;
  }
}

const getStyles = (() => ({
  overflow: css({
    overflow: 'hidden',
  })
}));
