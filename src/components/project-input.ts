/// <reference path="../util/validation.ts" />
/// <reference path="../decorators/auto-bind.ts" />
/// <reference path="./base-component.ts" />
/// <reference path="../state/project-state.ts" />

namespace App {
  // UserInput Form
  export class ProjectInput extends ComponentBaseClass<
    HTMLDivElement,
    HTMLFormElement
  > {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
      super("project-input", "app", true, "user-input");
      this.titleInputElement = this.element.querySelector<HTMLInputElement>(
        "#title"
      )!;
      this.descriptionInputElement = this.element.querySelector<HTMLInputElement>(
        "#description"
      )!;
      this.peopleInputElement = this.element.querySelector<HTMLInputElement>(
        "#people"
      )!;
      this.configure();
    }

    renderContent() {}
    private gatherUserInput(): [string, string, number] | void {
      const enteredTitle = this.titleInputElement.value;
      const enteredDescription = this.descriptionInputElement.value;
      const enteredPeople = +this.peopleInputElement.value;

      const titleValidatable: Validatable = {
        value: enteredTitle,
        required: true,
        maxLength: 50,
      };
      const descriptionValidatable: Validatable = {
        value: enteredDescription,
        required: true,
        minLength: 5,
      };
      const peopleValidatable: Validatable = {
        value: enteredPeople,
        required: true,
        min: 1,
      };

      if (validate(titleValidatable, descriptionValidatable, peopleValidatable))
        return [enteredTitle, enteredDescription, enteredPeople];
      else {
        alert("invalid input");
        return;
      }
    }

    private clearUserInput() {
      this.titleInputElement.value = "";
      this.descriptionInputElement.value = "";
      this.peopleInputElement.value = "";
    }

    @AutoBind
    private handleSubmit(event: Event) {
      event.preventDefault();
      const userInput = this.gatherUserInput();
      if (Array.isArray(userInput)) {
        const [title, description, people] = userInput;
        this.clearUserInput();
        projectState.addProject(title, description, people);
      }
    }

    configure() {
      this.element.addEventListener("submit", this.handleSubmit);
    }
  }
}
