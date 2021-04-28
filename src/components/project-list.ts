import { ComponentBaseClass } from "./base-component.js";
import { Project } from "../models/project.js";
import { DragTarget } from "../models/drag-drop.js";
import { AutoBind } from "../decorators/auto-bind.js";
import { projectState } from "../state/project-state.js";
import { ProjectItem } from "./project-item.js";
import { ProjectStatus } from "../models/project.js";

// Project List
export class ProjectList
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
