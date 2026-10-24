import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import dns from 'dns';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

// Configure reliable DNS servers for MongoDB Atlas SRV lookup on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Use default system resolver
}

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/edupulse';
const CONFIGURED_URI = process.env.MONGODB_URI || DEFAULT_URI;

export interface DbStatus {
  isConnected: boolean;
  state: 'connected' | 'connecting' | 'disconnected' | 'error';
  mode: 'embedded-persistent' | 'external';
  host?: string;
  name?: string;
  uriPreview: string;
  error?: string;
}

let activeUri = CONFIGURED_URI;
let lastError: string | null = null;
let mongodInstance: MongoMemoryServer | null = null;
let connectionMode: 'embedded-persistent' | 'external' = 'external';

export const connectDB = async (): Promise<boolean> => {
  mongoose.set('strictQuery', false);

  // 1. First attempt: connect to configured MONGODB_URI (e.g. Atlas or running local mongod)
  try {
    const isRemote = CONFIGURED_URI.startsWith('mongodb+srv://') || !CONFIGURED_URI.includes('127.0.0.1');
    const maskedUri = CONFIGURED_URI.replace(/\/\/[^@]*@/, '//***:***@');
    console.log(`[MongoDB] Attempting connection to configured URI: ${maskedUri}...`);

    await mongoose.connect(CONFIGURED_URI, {
      serverSelectionTimeoutMS: isRemote ? 8000 : 2000,
    });

    activeUri = CONFIGURED_URI;
    connectionMode = 'external';
    lastError = null;
    console.log(`[MongoDB] Successfully connected to External/Local MongoDB: ${mongoose.connection.name} on ${mongoose.connection.host}`);
    return true;
  } catch (err: any) {
    const isLocalhost = CONFIGURED_URI.includes('127.0.0.1') || CONFIGURED_URI.includes('localhost');
    console.warn(`[MongoDB] Primary connection attempt could not reach ${CONFIGURED_URI} (${err.message}).`);

    // 2. If localhost and not running, auto-spin up embedded persistent MongoDB server!
    if (isLocalhost) {
      try {
        console.log(`[MongoDB] Initializing auto-managed Embedded MongoDB with persistent WiredTiger disk storage...`);
        const dataDir = path.resolve(process.cwd(), 'server/data/db');
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }

        mongodInstance = await MongoMemoryServer.create({
          instance: {
            dbPath: dataDir,
            storageEngine: 'wiredTiger',
            dbName: 'edupulse',
          },
        });

        const embeddedUri = mongodInstance.getUri() + 'edupulse';
        activeUri = embeddedUri;
        connectionMode = 'embedded-persistent';

        await mongoose.connect(embeddedUri);

        lastError = null;
        console.log(`================================================================`);
        console.log(`[MongoDB] Embedded Persistent MongoDB Server running & connected!`);
        console.log(`[MongoDB] Database: ${mongoose.connection.name} (WiredTiger storage at server/data/db)`);
        console.log(`[MongoDB] URI: ${embeddedUri}`);
        console.log(`================================================================`);
        return true;
      } catch (embeddedErr: any) {
        lastError = embeddedErr.message;
        console.error(`[MongoDB] Failed to start embedded MongoDB server:`, embeddedErr.message);
        return false;
      }
    } else {
      lastError = err.message;
      return false;
    }
  }
};

mongoose.connection.on('connected', () => {
  lastError = null;
  console.log('[MongoDB] Connection established.');
});

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Connection lost.');
});

mongoose.connection.on('error', (err) => {
  lastError = err.message;
  console.error('[MongoDB] Connection error:', err.message);
});

export const getDbStatus = (): DbStatus => {
  const readyState = mongoose.connection.readyState;
  const isConnected = readyState === 1;

  let state: DbStatus['state'] = 'disconnected';
  if (readyState === 1) state = 'connected';
  else if (readyState === 2) state = 'connecting';
  else if (lastError) state = 'error';

  const uriPreview = activeUri.replace(/\/\/[^@]*@/, '//***:***@');

  return {
    isConnected,
    state,
    mode: connectionMode,
    host: mongoose.connection.host || undefined,
    name: mongoose.connection.name || 'edupulse',
    uriPreview,
    error: lastError || undefined,
  };
};

// Graceful process cleanup
const handleShutdown = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongodInstance) {
      await mongodInstance.stop();
      console.log('[MongoDB] Embedded MongoDB server stopped.');
    }
  } catch (e) {}
};

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);

export default connectDB;

