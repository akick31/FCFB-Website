export const startPolling = (poll, intervalMs, onError) => {
    const controller = new AbortController();
    let inFlight = false;
    let timer;

    const stop = () => {
        controller.abort();
        clearInterval(timer);
    };

    const run = async () => {
        if (controller.signal.aborted || inFlight) {
            return;
        }
        inFlight = true;
        try {
            if ((await poll(controller.signal)) === false) {
                stop();
            }
        } catch (error) {
            if (!controller.signal.aborted) {
                onError(error);
            }
        } finally {
            inFlight = false;
        }
    };

    timer = setInterval(run, intervalMs);
    run();
    return stop;
};
