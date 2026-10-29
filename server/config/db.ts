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

const DEFAULT_LOCAL_URI = 'mongodb://127.0.0.1:27017/edupulse';
const CONFIGURED_URI = process.env.MONGODB_URI || DEFAULT_LOCAL_URI;

export interface DbStatus {
  isConnected: boolean;
  state: 'connected' | 'connecting' | 'disconnected' | 'error';
  mode: 'embedded-persistent' | 'external' | 'local';
  host?: string;
  name?: string;
  uriPreview: string;
  error?: string;
}

let activeUri = CONFIGURED_URI;
let lastError: string | null = null;
let mongodInstance: MongoMemoryServer | null = null;
let connectionMode: 'embedded-persistent' | 'external' | 'local' = 'external';

export const connectDB = async (): Promise<boolean> => {
  mongoose.set('strictQuery', false);

  // 1. First attempt: connect to configured MONGODB_URI (e.g. Atlas or user-specified)
  try {
    const isRemote = CONFIGURED_URI.startsWith('mongodb+srv://') || !CONFIGURED_URI.includes('127.0.0.1');
    const maskedUri = CONFIGURED_URI.replace(/\/\/[^@]*@/, '//***:***@');
    console.log(`[MongoDB] Attempting connection to configured URI: ${maskedUri}...`);

    await mongoose.connect(CONFIGURED_URI, {
      serverSelectionTimeoutMS: isRemote ? 6000 : 2000,
    });

    activeUri = CONFIGURED_URI;
    connectionMode = isRemote ? 'external' : 'local';
    lastError = null;
    console.log(`[MongoDB] Successfully connected to ${isRemote ? 'Atlas' : 'Local'} MongoDB: ${mongoose.connection.name} on ${mongoose.connection.host}`);
    return true;
  } catch (err: any) {
    console.warn(`[MongoDB] Primary connection attempt to ${CONFIGURED_URI.replace(/\/\/[^@]*@/, '//***:***@')} failed: ${err.message}`);
    lastError = err.message;

    // 2. Second attempt: if configured URI was remote Atlas, try local MongoDB service on 127.0.0.1
    if (CONFIGURED_URI !== DEFAULT_LOCAL_URI) {
      try {
        console.log(`[MongoDB] Falling back to local MongoDB daemon (${DEFAULT_LOCAL_URI})...`);
        await mongoose.connect(DEFAULT_LOCAL_URI, { serverSelectionTimeoutMS: 2000 });
        activeUri = DEFAULT_LOCAL_URI;
        connectionMode = 'local';
        lastError = null;
        console.log(`[MongoDB] Successfully connected to Local MongoDB daemon on 127.0.0.1`);
        return true;
      } catch (localErr: any) {
        console.warn(`[MongoDB] Local daemon not reachable (${localErr.message}).`);
      }
    }

    // 3. Third attempt: auto-spin up embedded persistent MongoDB server with WiredTiger disk storage
    try {
      console.log(`[MongoDB] Initializing auto-managed Persistent Embedded MongoDB (WiredTiger on-disk)...`);
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
      console.log(`[MongoDB] Persistent Embedded MongoDB Server running & connected!`);
      console.log(`[MongoDB] Database: ${mongoose.connection.name} (WiredTiger storage at server/data/db)`);
      console.log(`[MongoDB] URI: ${embeddedUri}`);
      console.log(`================================================================`);
      return true;
    } catch (embeddedErr: any) {
      lastError = `All MongoDB connection attempts failed: ${err.message}; Embedded startup: ${embeddedErr.message}`;
      console.error(`[MongoDB] Critical: Could not start embedded MongoDB:`, embeddedErr.message);
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

export const isDbConnected = (): boolean => mongoose.connection.readyState === 1;

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
