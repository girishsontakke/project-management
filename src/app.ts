/// <reference path="drag-drop-interface.ts"/>
namespace App {
  abstract class ComponentBaseClass<
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

  // UserInput Form
  class ProjectInput extends ComponentBaseClass<
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

  // Project Item
  class ProjectItem
    extends ComponentBaseClass<HTMLUListElement, HTMLLIElement>
    implements Draggable {
    private project: Project;

    get person() {
      return this.project.people === 1
        ? "1 person"
        : `${this.project.people} persons`;
    }

    constructor(hostId: string, project: Project) {
      super("single-project", hostId, false, project.id);
      this.project = project;
      this.configure();
      this.renderContent();
    }

    @AutoBind
    dragStartHandler(event: DragEvent) {
      event.dataTransfer!.setData("text/plain", this.project.id);
      event.dataTransfer!.effectAllowed = "move";
    }

    @AutoBind
    dragEndHandler(_event: DragEvent) {}

    configure() {
      this.element.addEventListener("dragstart", this.dragStartHandler);
      this.element.addEventListener("dragend", this.dragEndHandler);
    }

    renderContent() {
      this.element.querySelector(
        ".project-title"
      )!.innerHTML = this.project.title;
      this.element.querySelector(".project-people")!.innerHTML =
        this.person + " assigned";
      this.element.querySelector(
        ".project-description"
      )!.innerHTML = this.project.description;
    }
  }

  // Project List
  class ProjectList
    extends ComponentBaseClass<HTMLDivElement, HTMLElement>
    implements DragTarget {
    assignedProjects: Project[] = [];
    constructor(private type: "active" | "finished") {
      super("project-list", "app", false, `${type}-projects`);
      this.configure();
      this.renderContent();
    }

    @AutoBind
    dragOverHandler(event: DragEvent) {
      if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
        event.preventDefault();
        this.element.querySelector("ul")!.classList.add("droppable");
      }
    }

    @AutoBind
    dragLeaveHandler(_event: DragEvent) {
      this.element.querySelector("ul")!.classList.remove("droppable");
    }

    @AutoBind
    dropHandler(event: DragEvent) {
      const projectId = event.dataTransfer!.getData("text/plain");
      const listStatus =
        this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished;
      projectState.moveProject(projectId, listStatus);
    }

    configure() {
      projectState.addListner(
        (activeProjects: Project[], finishedProjects: Project[]) => {
          this.assignedProjects =
            this.type === "active" ? activeProjects : finishedProjects;
          this.renderProjects();
        }
      );
      this.element.addEventListener("dragover", this.dragOverHandler);
      this.element.addEventListener("dragleave", this.dragLeaveHandler);
      this.element.addEventListener("drop", this.dropHandler);
    }

    private renderProjects() {
      const projectList = document.querySelector<HTMLUListElement>(
        `#${this.type}-project-list`
      )!;

      projectList.innerHTML = "";

      for (const project of this.assignedProjects) {
        new ProjectItem(this.element.querySelector("ul")!.id, project);
      }
    }

    renderContent() {
      const listId = `${this.type}-project-list`;
      this.element.querySelector("ul")!.id = listId;
      this.element.querySelector(
        "h2"
      )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
    }
  }

  enum ProjectStatus {
    Active,
    Finished,
  }

  class Project {
    constructor(
      public id: string,
      public title: string,
      public description: string,
      public people: number,
      public status: ProjectStatus
    ) {}
  }

  type Listner<T> = (activeProjects: T[], finishedProjects: T[]) => void;

  class State<T> {
    protected listners: Listner<T>[] = [];
    addListner(listner: Listner<T>) {
      this.listners.push(listner);
    }
  }

  // project state
  class ProjectState extends State<Project> {
    private static instance: ProjectState;
    private activeProjects: Project[] = [];
    private finishedProjects: Project[] = [];
    private constructor() {
      super();
    }

    static getInstance() {
      if (this.instance) return this.instance;
      this.instance = new ProjectState();
      return this.instance;
    }

    addProject(title: string, description: string, numOfPeople: number) {
      const project = new Project(
        Math.random().toString(),
        title,
        description,
        numOfPeople,
        ProjectStatus.Active
      );
      this.activeProjects.push(project);
      this.updateListners();
    }

    moveProject(projectId: string, newStatus: ProjectStatus) {
      switch (newStatus) {
        case ProjectStatus.Active:
          const finishedProject = this.finishedProjects.find(
            (prj) => prj.id === projectId
          );
          if (finishedProject && finishedProject.status !== newStatus) {
            finishedProject.status = newStatus;
            this.finishedProjects = this.finishedProjects.filter(
              (prj) => prj.id !== projectId
            );
            this.activeProjects.push(finishedProject);
            this.updateListners();
          }
          break;
        case ProjectStatus.Finished:
          const activeProject = this.activeProjects.find(
            (prj) => prj.id === projectId
          );
          if (activeProject && activeProject.status !== newStatus) {
            activeProject.status = newStatus;
            this.activeProjects = this.activeProjects.filter(
              (prj) => prj.id !== projectId
            );
            this.finishedProjects.push(activeProject);
            this.updateListners();
          }
          break;
        default:
          break;
      }
    }

    private updateListners() {
      for (const listner of this.listners) {
        listner(this.activeProjects.slice(), this.finishedProjects.slice());
      }
    }
  }

  const projectState = ProjectState.getInstance();

  // autobind decorator
  function AutoBind(
    _target: any,
    _methodName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;
    const bindedDescriptor: PropertyDescriptor = {
      configurable: true,
      enumerable: false,
      get() {
        const newMethod = method.bind(this);
        return newMethod;
      },
    };
    return bindedDescriptor;
  }

  // Validation
  interface Validatable {
    value: string | number;
    required?: boolean;
    maxLength?: number;
    minLength?: number;
    max?: number;
    min?: number;
  }

  /* validate the user entered input */
  function validate(...validatableArray: Validatable[]) {
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

  new ProjectInput();
  new ProjectList("active");
  new ProjectList("finished");
}
