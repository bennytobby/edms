// Mock for @vercel/analytics/server
const track = jest.fn((event, properties) => {
    console.log(`[MOCK] Analytics track: ${event}`, properties);
    return Promise.resolve();
});

module.exports = {
    track
};
