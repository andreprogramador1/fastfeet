import Bee from 'bee-queue';
import DeliveryManMail from '../app/jobs/DeliveryManMail';
import DeliveryManCanceledMail from '../app/jobs/DeliveryManCanceledMail';
import redisConfig from '../config/redis';

const jobs = [DeliveryManMail, DeliveryManCanceledMail];

class Queue {
  constructor() {
    this.queues = {};

    this.init();
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  add(key, job) {
    return this.queues[key].bee.createJob(job).save();
  }

  processQueue() {
    jobs.forEach((job) => {
      const { bee, handle } = this.queues[job.key];

      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, err) {
    console.log(`Queue ${job.queue.name}: FAILED`, err);
  }
}

export default new Queue();
