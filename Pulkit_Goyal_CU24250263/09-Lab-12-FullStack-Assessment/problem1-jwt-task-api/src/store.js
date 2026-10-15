/**
 * In-Memory Data Store for Problem 1
 * Demonstrates deterministic, zero-dependency execution.
 * Author: Pulkit Goyal (CUID: CU24250263 | Roll 40 | Section A)
 */

const users = [
  {
    id: 'user_1',
    email: 'pulkitgoyal0103@gmail.com',
    name: 'Pulkit Goyal',
    cuid: 'CU24250263',
    passwordHash: '$2a$10$wK1W6t2gq7VwU9qK5x5B1e4zV.B1uJzN2i2Q0Xb4i2R1u6Y6r4Z3u' // demo hashed password
  }
];

const tasks = [
  {
    id: 'task_1',
    userId: 'user_1',
    title: 'Complete Full Stack Lab 12 Assessment',
    description: 'Solve all four engineering problems and prepare documentation.',
    status: 'IN_PROGRESS',
    createdAt: new Date().toISOString()
  },
  {
    id: 'task_2',
    userId: 'user_1',
    title: 'Review Django Template Inheritance (Lab 7-8)',
    description: 'Verify DRY layout blocks and query parameter filters.',
    status: 'COMPLETED',
    createdAt: new Date().toISOString()
  }
];

module.exports = { users, tasks };
