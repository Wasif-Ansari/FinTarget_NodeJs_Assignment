const express = require('express');
const { rateLimiterForMinute } = require('./middleware/rateLimiterForMinute');
const { rateLimiterForSecond } = require('./middleware/rateLimiterForSecond');
const { addTaskToQueue } = require('./taskQueue'); 

const app = express();
app.use(express.json()); // use json parser to handle request body in json format

// apply the rate limiter for minute limit
app.use(rateLimiterForMinute);
// apply the rate limiter for second limit
app.use(rateLimiterForSecond);
  
// create a post route for tasks
app.post('/api/v1/task', async (req, res) => {
    const userId = req.body.user_id;

    // check if the user_id is provided in the request
    if (!userId) {
        return res.status(400).json({ success: false, message: 'user id is required' });
    }

    try {
        // add the task to the queue 
        await addTaskToQueue(userId);

        res.status(200).json({
            success: true,
            message: `task for user ${userId} added to the queue`,
            worker: `handled by worker ${process.pid}` // return the worker process id that handled this request
        });
    } catch (error) {
        // log error if task couldn't be added to the queue
        console.error("error adding task to queue:", error);
        res.status(500).json({ success: false, message: 'internal server error' });
    }
});

// start the server at port 8080
app.listen(8080, () => {
    console.log('server started at port 8080');
});
