export async function collectTsFiles(root = "src") {
  const files: string[] = [];

  for await (const entry of Deno.readDir(root)) {
    const path = `${root}/${entry.name}`;

    if (entry.isDirectory) {
      files.push(...await collectTsFiles(path));
    } else if (path.endsWith(".ts")) {
      files.push(path);
    }
  }

  return files;
}
