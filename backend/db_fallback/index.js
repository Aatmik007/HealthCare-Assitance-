const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

// Ensure database folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getFilePath = (collection) => {
  return path.join(DATA_DIR, `${collection}.json`);
};

const readCollection = (collection) => {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading collection ${collection}:`, err);
    return [];
  }
};

const writeCollection = (collection, data) => {
  const filePath = getFilePath(collection);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`Error writing collection ${collection}:`, err);
    return false;
  }
};

const FallbackDB = {
  find: (collection, query = {}) => {
    const items = readCollection(collection);
    return items.filter(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  },

  findOne: (collection, query = {}) => {
    const items = readCollection(collection);
    return items.find(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    }) || null;
  },

  findById: (collection, id) => {
    const items = readCollection(collection);
    return items.find(item => item._id === id) || null;
  },

  insert: (collection, doc) => {
    const items = readCollection(collection);
    const newDoc = {
      _id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    };
    items.push(newDoc);
    writeCollection(collection, items);
    return newDoc;
  },

  update: (collection, query, updateData) => {
    const items = readCollection(collection);
    let updatedCount = 0;
    
    const newItems = items.map(item => {
      let matches = true;
      for (let key in query) {
        if (item[key] !== query[key]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        updatedCount++;
        return {
          ...item,
          ...updateData,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });

    if (updatedCount > 0) {
      writeCollection(collection, newItems);
    }
    return updatedCount;
  },

  delete: (collection, query) => {
    const items = readCollection(collection);
    const initialLength = items.length;
    const filtered = items.filter(item => {
      for (let key in query) {
        if (item[key] === query[key]) return false;
      }
      return true;
    });
    
    if (filtered.length !== initialLength) {
      writeCollection(collection, filtered);
    }
    return initialLength - filtered.length;
  }
};

module.exports = FallbackDB;
