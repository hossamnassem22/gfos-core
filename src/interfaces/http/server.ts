import { HttpKernel } from "./kernel.ts";

const kernel = new HttpKernel();
await kernel.start(3000);
