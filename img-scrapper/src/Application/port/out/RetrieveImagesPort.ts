export interface RetrieveImagesPort {
  retrieveImages(): string[] | Promise<string[]>;
}