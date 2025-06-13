import * as React from "react"
import styled from "@emotion/styled"
import { css } from "@emotion/react"
import type { Theme } from "@mui/material/styles"

// prettier-ignore
const hoverSprite = (theme: Theme) => css`
  background-image: url("data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 0H17C17.5523 0 18 0.44772 18 1V17C18 17.5523 17.5523 18 17 18H1C0.44772 18 0 17.5523 0 17V1C0 0.44772 0.44772 0 1 0ZM2 2V16H16V2H2Z' fill='${encodeURIComponent(theme.custom.colors.silverGrayDark)}'/%3E%3C/svg%3E%0A");`

// prettier-ignore
const checkedSprite = (theme: Theme) => css`
  background-image: url("data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 0H17C17.5523 0 18 0.44772 18 1V17C18 17.5523 17.5523 18 17 18H1C0.44772 18 0 17.5523 0 17V1C0 0.44772 0.44772 0 1 0ZM8.0026 13L15.0737 5.92893L13.6595 4.51472L8.0026 10.1716L5.17421 7.3431L3.75999 8.7574L8.0026 13Z' fill='${encodeURIComponent(theme.custom.colors.red)}'/%3E%3C/svg%3E%0A");`

/**
 * Base styles for child checkboxes.
 */
// prettier-ignore
const childCheckboxStyles = (theme: Theme) => css`
  input[type="checkbox"] {
    margin-left: 0;
    margin-right: 0;
    height: 24px;
    width: 24px;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 0H17C17.5523 0 18 0.44772 18 1V17C18 17.5523 17.5523 18 17 18H1C0.44772 18 0 17.5523 0 17V1C0 0.44772 0.44772 0 1 0ZM2 2V16H16V2H2Z' fill='${encodeURIComponent(theme.custom.colors.silverGrayLight)}'/%3E%3C/svg%3E%0A");
    background-repeat: no-repeat;
    background-position: 3px 3px;
    flex-shrink: 0;
    cursor: pointer;

    &:disabled {
      cursor: not-allowed;
    }
  }

  input[type="checkbox"]:checked {
    ${checkedSprite(theme)}
    + .checkbox-label {
      color: ${theme.custom.colors.darkGray2};
    }
  }

  /*
  * This also triggers when the label is hovered.
  * See https://stackoverflow.com/a/9101344/2747370
  */
  input[type="checkbox"]:hover:not(:disabled, :checked) {
    ${hoverSprite(theme)}
    & + .checkbox-label {
      color: ${theme.custom.colors.darkGray2};
    }
  }
`;

const Container = styled.div<{ theme?: Theme }>(({ theme }) => [
  {
    height: 24,
    label: {
      display: "flex",
      alignItems: "center",
      cursor: "pointer",
      ...theme.typography.body2,
    },
    'input[type="checkbox"] + .checkbox-label': {
      color: theme.custom.colors.silverGrayDark,
      ...theme.typography.body2,
    },
    'input[type="checkbox"]:disabled + .checkbox-label': {
      cursor: "not-allowed",
    },
    'label:has(input[type="checkbox"]:disabled)': {
      cursor: "not-allowed",
    },
    '&& input[type="checkbox"]': {
      margin: 0,
      marginRight: 4,
      // Help avoid focus outline from being cutoff
      ":focus-visible": {
        outlineOffset: -1,
      },
    },
  },
  // Insert childCheckboxStyles and hoverSprite as additional css
  childCheckboxStyles(theme),
])

export type CheckboxProps = {
  label?: string
  value?: string
  name?: string
  checked?: boolean
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  disabled?: boolean
}

/**
 * A standalone checkbox. For several checkboxes together, use the `CheckboxGroup` component.
 */
const Checkbox: React.FC<CheckboxProps> = ({
  label,
  value,
  name,
  checked,
  onChange,
  className,
  disabled = false,
}) => {
  return (
    <Container className={className}>
      {label ? (
        <label>
          <input
            type="checkbox"
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
          />
          <span className="checkbox-label">{label}</span>
        </label>
      ) : (
        <input
          type="checkbox"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
      )}
    </Container>
  )
}

export { Checkbox, childCheckboxStyles }
