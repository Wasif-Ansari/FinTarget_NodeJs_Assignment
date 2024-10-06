# FinTargetNodeJsAssignment
# Node.js Rate Limiting and Task Queueing Assignment

## Overview

This project is a Node.js application that demonstrates rate limiting and task queueing using Redis and Bull. The application is designed to handle a high volume of API requests efficiently while respecting rate limits for each user.

## Approach

### Components
1. **API Server**: 
   - Built using Express.js.
   - Implements two rate limiters: one for requests per second and another for requests per minute.
   - Handles incoming tasks and enqueues them for processing.

2. **Rate Limiting**:
   - **Per Second**: Limits one request per second per user.
   - **Per Minute**: Limits 20 requests per minute per user.

3. **Task Queue**:
   - Uses Bull for queueing tasks.
   - Tasks are processed asynchronously with a simulated delay.

4. **Cluster Setup**:
   - Uses Node.js clustering to improve performance by utilizing multiple CPU cores.

### File Structure
- `index.js`: Main file where the Express server is set up and the API route is defined.
- `cluster.js`: Sets up clustering to handle multiple workers.
- `bull.js`: Configures Bull for task queueing and processing.
- `middleware/rateLimiterForMinute.js`: Implements rate limiting for requests per minute.
- `middleware/rateLimiterForSecond.js`: Implements rate limiting for requests per second.
- `taskQueue.js`: Manages task queueing and processing.
- `taskLogs.txt`: Log file where task completion details are stored.

## Prerequisites
- Node.js (v16 or higher recommended)
- Redis (make sure Redis server is running on `localhost:6379`)


## Installation
1. **Clone the Repository**

   ```bash
   git clone <your-repo-url>
   cd <your-repo-directory>

2. **Install Dependencies**
    ```bash
    npm install

3. **Setup environment variables**
Create a .env file in the root directory with the following content:
   ```bash
   REDIS_HOST=localhost    
   REDIS_PORT=6379

## How to run the application
1. **Start Redis Server** 
  - Make sure the Redis server is running. You can start it using:
     ```bash
      redis-server

2. **Start the Application** 
   - To start the server with clustering:
   ```bash
    node cluster.js

## Testing the Application
1. **Make API Requests**

- You can test the API by sending POST requests to 
   ```bash
   http://localhost:8080/api/v1/task

 - with the following JSON body:
   ```bash
      {
     "user_id": "123"
      }
   
 - Task completion logs are stored in taskLogs.txt.
