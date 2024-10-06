const cluster = require('cluster');

// check if this is the master process
if (cluster.isMaster) {
    // create two worker processes (forking two times)
    for (let i = 0; i < 2; i++) {
        cluster.fork();
    }

    // listen for any worker that exits (if it dies)
    cluster.on('exit', (worker) => {
        console.log(`worker ${worker.process.pid} died. restarting...`);
        // restart the worker by forking again
        cluster.fork();
    });
} else {
    // if not the master process, then load the express server from index.js
    require('./index');
}
