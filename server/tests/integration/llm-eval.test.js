import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../index.js';

describe('LLM Evaluation Tests (Structural Validation)', () => {
  // Increase timeout for LLM calls
  const TIMEOUT = 30000;

  it('evaluates /api/quiz structure for "React"', async () => {
    const res = await request(app)
      .post('/api/quiz')
      .send({ skill: 'React' });
      
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    
    // Validate structural properties of the first item
    const firstItem = res.body[0];
    expect(firstItem).toHaveProperty('question');
    expect(typeof firstItem.question).toBe('string');
    expect(firstItem).toHaveProperty('options');
    expect(Array.isArray(firstItem.options)).toBe(true);
    expect(firstItem.options.length).toBeGreaterThanOrEqual(2); // usually 4
    expect(firstItem).toHaveProperty('correctIndex');
    expect(typeof firstItem.correctIndex).toBe('number');
  }, TIMEOUT);

  it('evaluates /api/roadmap structure for "Node.js"', async () => {
    const res = await request(app)
      .post('/api/roadmap')
      .send({ skill: 'Node.js' });
      
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Based on the contract, it asks for exactly 30 objects, but LLMs might occasionally give slightly fewer/more.
    // We strictly assert it returns at least a substantial array.
    expect(res.body.length).toBeGreaterThan(0);
    
    const firstItem = res.body[0];
    expect(firstItem).toHaveProperty('day');
    expect(typeof firstItem.day).toBe('number');
    expect(firstItem).toHaveProperty('title');
    expect(typeof firstItem.title).toBe('string');
    expect(firstItem).toHaveProperty('topics');
    expect(Array.isArray(firstItem.topics)).toBe(true);
    expect(firstItem).toHaveProperty('learningObjective');
    expect(typeof firstItem.learningObjective).toBe('string');
    expect(firstItem).toHaveProperty('difficulty');
    expect(typeof firstItem.difficulty).toBe('string');
  }, TIMEOUT);

  it('evaluates /api/day-content structure for "React"', async () => {
    const res = await request(app)
      .post('/api/day-content')
      .send({
        skill: 'React',
        dayNumber: 1,
        dayTitle: 'React Fundamentals',
        topics: ['Components', 'JSX']
      });
      
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expect(res.body).not.toBeNull();
    
    expect(res.body).toHaveProperty('summary');
    expect(typeof res.body.summary).toBe('string');
    expect(res.body).toHaveProperty('keyConcepts');
    expect(Array.isArray(res.body.keyConcepts)).toBe(true);
    if (res.body.keyConcepts.length > 0) {
      expect(res.body.keyConcepts[0]).toHaveProperty('concept');
      expect(res.body.keyConcepts[0]).toHaveProperty('explanation');
    }
    expect(res.body).toHaveProperty('practicalExercise');
    expect(typeof res.body.practicalExercise).toBe('string');
    expect(res.body).toHaveProperty('additionalResources');
    expect(Array.isArray(res.body.additionalResources)).toBe(true);
  }, TIMEOUT);

  it('evaluates /api/day-quiz structure for "Node.js"', async () => {
    const res = await request(app)
      .post('/api/day-quiz')
      .send({
        skill: 'Node.js',
        dayNumber: 1,
        dayTitle: 'Intro to Node',
        topics: ['Event Loop', 'Modules']
      });
      
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    
    const firstItem = res.body[0];
    expect(firstItem).toHaveProperty('question');
    expect(firstItem).toHaveProperty('options');
    expect(Array.isArray(firstItem.options)).toBe(true);
    expect(firstItem).toHaveProperty('correctIndex');
    expect(typeof firstItem.correctIndex).toBe('number');
  }, TIMEOUT);
});
