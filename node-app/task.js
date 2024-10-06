async function task(user_id) {
    console.log(`${user_id} - task completed at - ${Date.now()}`);
    // This is now handled in the queue processor
}

module.exports = { task };
