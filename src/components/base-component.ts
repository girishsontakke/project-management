namespace App {
  export abstract class ComponentBaseClass<
    T extends HTMLElement,
    U extends HTMLElement
  > {
    templateEl: HTMLTemplateElement;
    hostEl: T;
    element: U;

    constructor(
      templateId: string,
      hostId: string,
      insertAtBegining: boolean,
      elementId?: string
    ) {
      this.templateEl = document.getElementById(
        templateId
      )! as HTMLTemplateElement;
      this.hostEl = document.getElementById(hostId)! as T;
      this.element = document.importNode(this.templateEl.content, true)
        .firstElementChild as U;

      if (elementId) this.element.id = elementId;
      this.attach(insertAtBegining);
    }

    private attach(insertAtBegining: boolean) {
      this.hostEl.insertAdjacentElement(
        insertAtBegining ? "afterbegin" : "beforeend",
        this.element
      );
    }

    abstract configure(): void;
    abstract renderContent(): void;
  }
}
