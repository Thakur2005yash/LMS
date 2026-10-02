const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class Collection {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    this.data = [];
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.data = [];
        this.save();
      }
    } catch (err) {
      console.error(`Error loading collection ${this.name}:`, err.message);
      this.data = [];
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error(`Error saving collection ${this.name}:`, err.message);
    }
  }

  generateId() {
    return crypto.randomBytes(12).toString('hex');
  }

  matchesFilter(item, filter) {
    if (!filter || Object.keys(filter).length === 0) return true;
    for (const key of Object.keys(filter)) {
      const condition = filter[key];
      const itemVal = item[key];

      if (condition === undefined) continue;

      if (typeof condition === 'object' && condition !== null) {
        if ('$regex' in condition) {
          const flags = condition.$options || 'i';
          const reg = new RegExp(condition.$regex, flags);
          if (!reg.test(String(itemVal || ''))) return false;
        } else if ('$in' in condition) {
          if (!Array.isArray(condition.$in) || !condition.$in.includes(itemVal)) return false;
        } else if ('$gte' in condition) {
          if (itemVal < condition.$gte) return false;
        } else if ('$lte' in condition) {
          if (itemVal > condition.$lte) return false;
        } else if ('$ne' in condition) {
          if (itemVal === condition.$ne) return false;
        }
      } else if (typeof condition === 'function') {
        if (!condition(itemVal, item)) return false;
      } else {
        if (key === '_id' || key === 'id') {
          if (item._id !== condition && item.id !== condition) return false;
        } else {
          if (itemVal !== condition) return false;
        }
      }
    }
    return true;
  }

  find(filter = {}) {
    return this.data.filter(item => this.matchesFilter(item, filter));
  }

  findOne(filter = {}) {
    return this.data.find(item => this.matchesFilter(item, filter)) || null;
  }

  findById(id) {
    if (!id) return null;
    return this.data.find(item => item._id === id || item.id === id) || null;
  }

  create(doc) {
    const _id = doc._id || doc.id || this.generateId();
    const timestamp = new Date().toISOString();
    const newDoc = {
      ...doc,
      _id,
      id: _id,
      createdAt: doc.createdAt || timestamp,
      updatedAt: timestamp
    };
    this.data.push(newDoc);
    this.save();
    return newDoc;
  }

  insertMany(docs) {
    const timestamp = new Date().toISOString();
    const created = docs.map(doc => {
      const _id = doc._id || doc.id || this.generateId();
      return {
        ...doc,
        _id,
        id: _id,
        createdAt: doc.createdAt || timestamp,
        updatedAt: timestamp
      };
    });
    this.data.push(...created);
    this.save();
    return created;
  }

  findByIdAndUpdate(id, updates, options = { new: true }) {
    const index = this.data.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;

    const existing = this.data[index];
    const updated = {
      ...existing,
      ...updates,
      _id: existing._id,
      id: existing._id,
      updatedAt: new Date().toISOString()
    };
    this.data[index] = updated;
    this.save();
    return options.new ? updated : existing;
  }

  findByIdAndDelete(id) {
    const index = this.data.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;
    const deleted = this.data.splice(index, 1)[0];
    this.save();
    return deleted;
  }

  deleteMany(filter = {}) {
    const initialLen = this.data.length;
    this.data = this.data.filter(item => !this.matchesFilter(item, filter));
    const deletedCount = initialLen - this.data.length;
    this.save();
    return { deletedCount };
  }

  count(filter = {}) {
    return this.find(filter).length;
  }
}

const db = {
  Users: new Collection('users'),
  Courses: new Collection('courses'),
  Enrollments: new Collection('enrollments'),
  Quizzes: new Collection('quizzes'),
  Reviews: new Collection('reviews'),
  Certificates: new Collection('certificates'),
  Discussions: new Collection('discussions'),
  LiveClasses: new Collection('live_classes')
};

module.exports = db;
