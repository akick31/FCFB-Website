import { startPolling } from './polling';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('skips interval ticks while a request is pending, then resumes', async () => {
    let resolve;
    const poll = jest
        .fn()
        .mockReturnValueOnce(
            new Promise((done) => {
                resolve = done;
            })
        )
        .mockResolvedValue(true);
    const stop = startPolling(poll, 3000, jest.fn());
    await jest.advanceTimersByTimeAsync(9000);
    expect(poll).toHaveBeenCalledTimes(1);
    resolve(true);
    await jest.advanceTimersByTimeAsync(3000);
    expect(poll).toHaveBeenCalledTimes(2);
    stop();
});

test('stops after terminal completion', async () => {
    const poll = jest.fn().mockResolvedValue(false);
    startPolling(poll, 3000, jest.fn());
    await jest.advanceTimersByTimeAsync(9000);
    expect(poll).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
});

test('reports a current request failure and retries at the existing interval', async () => {
    const error = new Error('Unavailable');
    const poll = jest.fn().mockRejectedValueOnce(error).mockResolvedValue(false);
    const onError = jest.fn();
    startPolling(poll, 3000, onError);
    await jest.advanceTimersByTimeAsync(3000);
    expect(onError).toHaveBeenCalledWith(error);
    expect(poll).toHaveBeenCalledTimes(2);
    expect(jest.getTimerCount()).toBe(0);
});

test('cancellation aborts the callback signal and suppresses late failures', async () => {
    let reject;
    let signal;
    const poll = jest.fn((currentSignal) => {
        signal = currentSignal;
        return new Promise((resolve, fail) => {
            reject = fail;
        });
    });
    const onError = jest.fn();
    const stop = startPolling(poll, 3000, onError);
    stop();
    expect(signal.aborted).toBe(true);
    reject(new Error('Obsolete request'));
    await jest.advanceTimersByTimeAsync(9000);
    expect(onError).not.toHaveBeenCalled();
    expect(poll).toHaveBeenCalledTimes(1);
});
