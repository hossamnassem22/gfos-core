export interface PostCommand {
  id: string;
  amount: bigint;
}

export class LedgerPostingService {
  /**
   * تم إزالة 'async' لأن العملية لا تحتوي على 'await'.
   * هذا يمنع خطأ 'require-await' في Deno.
   */
  post(cmd: PostCommand): string {
    const _cmd = cmd;
    return "posted";
  }
}
