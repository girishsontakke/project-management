namespace App {
  // Validation
  export interface Validatable {
    value: string | number;
    required?: boolean;
    maxLength?: number;
    minLength?: number;
    max?: number;
    min?: number;
  }

  /* validate the user entered input */
  export function validate(...validatableArray: Validatable[]) {
    let isValid = true;
    validatableArray.forEach((validatableInput) => {
      if (!isValid) return;
      if (validatableInput.required) {
        isValid =
          isValid && validatableInput.value.toString().trim().length != 0;
      }

      if (
        validatableInput.maxLength != null &&
        typeof validatableInput.value === "string"
      ) {
        isValid =
          isValid &&
          validatableInput.value.length <= validatableInput.maxLength;
      }

      if (
        validatableInput.minLength != null &&
        typeof validatableInput.value === "string"
      ) {
        isValid =
          isValid &&
          validatableInput.value.length >= validatableInput.minLength;
      }

      if (
        validatableInput.max != null &&
        typeof validatableInput.value === "number"
      ) {
        isValid = isValid && validatableInput.value <= validatableInput.max;
      }

      if (
        validatableInput.min != null &&
        typeof validatableInput.value === "number"
      ) {
        isValid = isValid && validatableInput.value >= validatableInput.min;
      }
    });

    return isValid;
  }
}
