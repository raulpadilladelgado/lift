import React, { useState, useRef } from 'react';
import { Download, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { t } from '../utils/translations';

interface Props {
  onExport: () => void;
  onImport: (content: string) => boolean;
}

export const SettingsScreen: React.FC<Props> = ({ onExport, onImport }) => {
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = onImport(content);

      if (success) {
        setImportStatus('success');
        setTimeout(() => {
          setImportStatus('idle');
        }, 1500);
      } else {
        setImportStatus('error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-ios-text">{t.labels.settings}</h1>
        <p className="text-sm text-ios-gray mt-2">{t.labels.settingsDesc || 'Manage your data and backup'}</p>
      </div>

      {/* Settings Options */}
      <div className="space-y-3">
        <button
          onClick={onExport}
          className="w-full flex items-center justify-between p-4 bg-ios-card rounded-xl active:opacity-70 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-ios-blue">
              <Download size={20} />
            </div>
            <div className="text-left">
              <div className="font-semibold text-ios-text">{t.actions.export}</div>
              <div className="text-xs text-ios-gray">{t.labels.exportDesc}</div>
            </div>
          </div>
        </button>

        <button
          onClick={handleImportClick}
          className="w-full flex items-center justify-between p-4 bg-ios-card rounded-xl active:opacity-70 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
              <Upload size={20} />
            </div>
            <div className="text-left">
              <div className="font-semibold text-ios-text">{t.actions.import}</div>
              <div className="text-xs text-ios-gray">{t.labels.importDesc}</div>
            </div>
          </div>
        </button>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />

        {/* Status Messages */}
        {importStatus === 'success' && (
          <div className="flex items-center gap-2 justify-center text-green-600 dark:text-green-400 pt-2 animate-fadeIn">
            <CheckCircle2 size={16} />
            <span className="text-sm font-medium">{t.labels.importSuccess}</span>
          </div>
        )}
        {importStatus === 'error' && (
          <div className="flex items-center gap-2 justify-center text-red-500 pt-2 animate-fadeIn">
            <AlertCircle size={16} />
            <span className="text-sm font-medium">{t.labels.importError}</span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="pt-6 border-t border-ios-separator">
        <p className="text-xs text-ios-gray text-center leading-relaxed">
          {t.labels.settingsInfo || 'Your data is stored locally on your device. Use backup to transfer your data to another device.'}
        </p>
      </div>
    </div>
  );
};
