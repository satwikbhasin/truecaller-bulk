declare module "jspdf" {
  export class jsPDF {
    constructor(
      orientation?: string,
      unit?: string,
      format?: string,
      compress?: boolean
    );
    text(text: string, x: number, y: number): void;
    save(filename: string): void;
  }
}
