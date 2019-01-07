import * as assert from "assert";

export async function assertThrowsAsync(fn : Function, regExp : string | Error | undefined) {
  let f = () => {};
  try {
    await fn();
  } catch(e) {
    f = () => {throw e};
  } finally {
    assert.throws(f, regExp);
  }
}
