export class RepositoryRegistry {
  private repositories = new Map<string, any>();

  register(name: string, repo: any) {
    this.repositories.set(name, repo);
  }

  get(name: string) {
    return this.repositories.get(name);
  }
}
