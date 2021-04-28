import { Project, ProjectStatus } from "../models/project.js";

type Listner<T> = (activeProjects: T[], finishedProjects: T[]) => void;

class State<T> {
  protected listners: Listner<T>[] = [];
  addListner(listner: Listner<T>) {
    this.listners.push(listner);
  }
}

// project state
export class ProjectState extends State<Project> {
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

export const projectState = ProjectState.getInstance();
