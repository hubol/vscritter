import { Disposable } from 'vscode';

export interface RenderCommand {
  experience: number
  experienceMaximum: number
  level: number
  style: number
}

export interface ICritterRenderer extends Disposable {
  render(command: RenderCommand): void
}
