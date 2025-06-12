import { signalRConnection } from './signalr-connection';

/**
 * SignalR event helper for specific events
 */
let analysisHandler: (() => void) | null = null;
let importHandler: (() => void) | null = null;

export const registerNotificationEvents = {
  analysisCompleted: (handler: () => void) => {
    // Clean up existing handler first
    if (analysisHandler) {
      signalRConnection.off('analysis_completed', analysisHandler);
    }

    analysisHandler = handler;
    signalRConnection.on('analysis_completed', handler);
    console.log('Registered analysis_completed handler');
  },

  importCompleted: (handler: () => void) => {
    // Clean up existing handler first  
    if (importHandler) {
      signalRConnection.off('import_completed', importHandler);
    }

    importHandler = handler;
    signalRConnection.on('import_completed', handler);
    console.log('Registered import_completed handler');
  }
};

export const unregisterNotificationEvents = {
  analysisCompleted: () => {
    if (analysisHandler) {
      signalRConnection.off('analysis_completed', analysisHandler);
      analysisHandler = null;
    }
  },

  importCompleted: () => {
    if (importHandler) {
      signalRConnection.off('import_completed', importHandler);
      importHandler = null;
    }
  },

  all: () => {
    unregisterNotificationEvents.analysisCompleted();
    unregisterNotificationEvents.importCompleted();
    console.log('Unregistered all notification handlers');
  }
};