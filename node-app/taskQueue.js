const Bull = require('bull');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const { REDIS_HOST, REDIS_PORT } = process.env;

// configure redis connection options for bull queue
const redisOptions = {
    redis: { host: REDIS_HOST, port: REDIS_PORT }
};

// create a new task queue
const taskQueue = new Bull('taskQueue', redisOptions);

// function to add a new task to the queue
const addTaskToQueue = async (userId) => {
    await taskQueue.add({ userId });
};

// process the jobs in the queue
taskQueue.process(async (job, done) => {
    const { userId } = job.data; 
    try {
        // log task completion with a timestamp
        console.log(`${userId} - task completed at - ${Date.now()}`);
        
        // log task info into a text file
        const logMessage = `${userId} - task completed at - ${new Date().toISOString()}\n`;
        const logFilePath = path.join(__dirname, 'taskLogs.txt');
        fs.appendFileSync(logFilePath, logMessage, 'utf8'); // write log to file

        done(); 
    } catch (error) {
        console.error(`error processing task for user ${userId}:`, error);
        done(error); 
    }
});

module.exports = {
    addTaskToQueue
};
