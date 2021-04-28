/// <reference path="../decorators/auto-bind.ts" />
/// <reference path="./base-component.ts" />

namespace App {
  // Project Item
  export class ProjectItem
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
}
