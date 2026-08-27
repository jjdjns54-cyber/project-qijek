export const ASSET_WAIT_LIMIT_MS = 600;

export async function waitForAssets(assets: Promise<unknown>[]) {
  if (!assets.length) return;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      Promise.allSettled(assets),
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, ASSET_WAIT_LIMIT_MS);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
