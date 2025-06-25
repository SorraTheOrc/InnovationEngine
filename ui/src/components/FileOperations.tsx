import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  FolderOpen as OpenIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Description as FileIcon,
  History as HistoryIcon,
  Share as ShareIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useLiveRegion } from '../hooks/useLiveRegion';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useFocusManagement } from '../hooks/useFocusManagement';
import { useAriaAttributes } from '../hooks/useAriaAttributes';
import { ExecDoc, FileOperationResult } from '../types';

interface FileOperationsProps {
  currentDoc: ExecDoc | null;
  onSave: (filename: string, format: FileFormat) => Promise<FileOperationResult>;
  onLoad: (file: File) => Promise<FileOperationResult>;
  onExport: (format: FileFormat) => Promise<FileOperationResult>;
  onImport: () => Promise<FileOperationResult>;
  recentFiles?: RecentFile[];
  onDeleteFile?: (filename: string) => Promise<FileOperationResult>;
  readOnly?: boolean;
}

interface RecentFile {
  name: string;
  path: string;
  lastModified: Date;
  size: number;
  format: FileFormat;
}

type FileFormat = 'markdown' | 'json' | 'yaml' | 'pdf' | 'html';

interface FileDialogProps {
  open: boolean;
  mode: 'save' | 'load' | 'export';
  onClose: () => void;
  onConfirm: (filename: string, format: FileFormat) => void;
  currentFilename?: string;
  loading?: boolean;
}

const FileDialog: React.FC<FileDialogProps> = ({
  open,
  mode,
  onClose,
  onConfirm,
  currentFilename = '',
  loading = false
}) => {
  const [filename, setFilename] = useState(currentFilename);
  const [format, setFormat] = useState<FileFormat>('markdown');
  const { announcePolite } = useLiveRegion();
  const { generateId } = useAriaAttributes();

  const filenameInputId = generateId('filename-input');
  const formatSelectId = generateId('format-select');

  const handleConfirm = () => {
    if (filename.trim()) {
      onConfirm(filename.trim(), format);
      announcePolite(`${mode} operation initiated for ${filename.trim()}`);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && filename.trim()) {
      handleConfirm();
    }
  };

  const getDialogTitle = () => {
    switch (mode) {
      case 'save': return 'Save Document';
      case 'load': return 'Load Document';
      case 'export': return 'Export Document';
      default: return 'File Operation';
    }
  };

  const getFormatOptions = () => {
    switch (mode) {
      case 'save':
      case 'load':
        return ['markdown', 'json'];
      case 'export':
        return ['markdown', 'json', 'yaml', 'pdf', 'html'];
      default:
        return ['markdown'];
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="file-dialog-title"
    >
      <DialogTitle id="file-dialog-title">
        {getDialogTitle()}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <TextField
            id={filenameInputId}
            label="Filename"
            fullWidth
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter filename..."
            helperText="Include the file extension or select a format below"
            disabled={loading}
            autoFocus
          />

          <FormControl fullWidth>
            <InputLabel id={`${formatSelectId}-label`}>Format</InputLabel>
            <Select
              labelId={`${formatSelectId}-label`}
              id={formatSelectId}
              value={format}
              label="Format"
              onChange={(e) => setFormat(e.target.value as FileFormat)}
              disabled={loading}
            >
              {getFormatOptions().map((fmt) => (
                <MenuItem key={fmt} value={fmt}>
                  {fmt.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {loading && (
            <Box>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Processing file operation...
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!filename.trim() || loading}
        >
          {mode === 'save' ? 'Save' : mode === 'load' ? 'Load' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * FileOperations Component
 * 
 * File management with comprehensive accessibility
 * Features:
 * - CTRL+S keyboard shortcut for saving
 * - Screen reader announcements for all file operations
 * - Accessible file list structure
 * - Loading states and error handling
 */
export const FileOperations: React.FC<FileOperationsProps> = ({
  currentDoc,
  onSave,
  onLoad,
  onExport,
  onImport,
  recentFiles = [],
  onDeleteFile,
  readOnly = false
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'save' | 'load' | 'export'>('save');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FileOperationResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Accessibility hooks
  const { announcePolite, announceAssertive } = useLiveRegion();
  const { saveFocus, restoreFocus } = useFocusManagement();
  const { createButtonAria, generateId } = useAriaAttributes();

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  // Generate stable IDs
  const recentFilesListId = generateId('recent-files-list');

  // Keyboard shortcuts
  const keyboardShortcuts = [
    {
      key: 's',
      ctrlKey: true,
      description: 'Save document',
      handler: (event: KeyboardEvent) => {
        event.preventDefault();
        if (!readOnly && currentDoc) {
          handleOpenDialog('save');
        }
      }
    },
    {
      key: 'o',
      ctrlKey: true,
      description: 'Open document',
      handler: (event: KeyboardEvent) => {
        event.preventDefault();
        handleTriggerFileInput();
      }
    }
  ];

  useKeyboardNavigation(keyboardShortcuts);

  const handleOpenDialog = (mode: 'save' | 'load' | 'export') => {
    saveFocus();
    setDialogMode(mode);
    setDialogOpen(true);
    setResult(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    restoreFocus();
  };

  const handleFileOperation = async (filename: string, format: FileFormat) => {
    setLoading(true);
    setResult(null);

    try {
      let operationResult: FileOperationResult;

      switch (dialogMode) {
        case 'save':
          operationResult = await onSave(filename, format);
          announcePolite(`Document saved as ${filename}.${format}`);
          break;
        case 'export':
          operationResult = await onExport(format);
          announcePolite(`Document exported in ${format} format`);
          break;
        default:
          throw new Error('Invalid operation mode');
      }

      setResult(operationResult);
      
      if (operationResult.success) {
        setTimeout(() => {
          handleCloseDialog();
        }, 1500);
      } else {
        announceAssertive(`Operation failed: ${operationResult.message}`);
      }

    } catch (error) {
      const errorResult: FileOperationResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      setResult(errorResult);
      announceAssertive(`Operation failed: ${errorResult.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setLoading(true);

    try {
      announcePolite(`Loading file: ${file.name}`);
      const result = await onLoad(file);
      setResult(result);
      
      if (result.success) {
        announcePolite(`File ${file.name} loaded successfully`);
      } else {
        announceAssertive(`Failed to load file: ${result.message}`);
      }
    } catch (error) {
      announceAssertive(`Failed to load file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteFile = async (filename: string) => {
    if (!onDeleteFile) return;

    try {
      announcePolite(`Deleting file: ${filename}`);
      const result = await onDeleteFile(filename);
      
      if (result.success) {
        announcePolite(`File ${filename} deleted successfully`);
      } else {
        announceAssertive(`Failed to delete file: ${result.message}`);
      }
    } catch (error) {
      announceAssertive(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Button aria attributes
  const saveButtonAria = createButtonAria('Save document (Ctrl+S)', {
    disabled: !currentDoc || readOnly
  });

  const loadButtonAria = createButtonAria('Load document (Ctrl+O)');

  const exportButtonAria = createButtonAria('Export document', {
    disabled: !currentDoc
  });

  const importButtonAria = createButtonAria('Import document');

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" component="h1" gutterBottom sx={{ fontSize: '2rem', fontWeight: 'bold' }}>
          <FileIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          File Operations
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Save, load, export, and manage your executable documents. 
          Use Ctrl+S to save or Ctrl+O to open files quickly.
        </Typography>
      </Box>

      {/* Operation Result */}
      {result && (
        <Alert 
          severity={result.success ? 'success' : 'error'} 
          sx={{ mb: 3 }}
          role="alert"
        >
          {result.message}
          {result.fileName && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              File: {result.fileName}
            </Typography>
          )}
        </Alert>
      )}

      {/* Main Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h2" component="h2" gutterBottom sx={{ fontSize: '1.5rem' }}>
            Document Actions
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Button
              {...saveButtonAria}
              ref={saveButtonRef}
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => handleOpenDialog('save')}
              disabled={!currentDoc || readOnly}
            >
              Save
            </Button>

            <Button
              {...loadButtonAria}
              variant="outlined"
              startIcon={<OpenIcon />}
              onClick={handleTriggerFileInput}
            >
              Load
            </Button>

            <Button
              {...exportButtonAria}
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleOpenDialog('export')}
              disabled={!currentDoc}
            >
              Export
            </Button>

            <Button
              {...importButtonAria}
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={onImport}
            >
              Import
            </Button>
          </Box>

          {/* Current Document Info */}
          {currentDoc && (
            <Box sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="h3" component="h3" gutterBottom sx={{ fontSize: '1.25rem' }}>
                Current Document
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Title:</strong> {currentDoc.title || 'Untitled'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Steps:</strong> {currentDoc.steps.length} | 
                <strong> Last Updated:</strong> {currentDoc.updatedAt.toLocaleString()} |
                <strong> Author:</strong> {currentDoc.metadata.author}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Recent Files */}
      {recentFiles.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h2" component="h2" sx={{ fontSize: '1.5rem', flex: 1 }}>
                <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Recent Files
              </Typography>
              
              <Tooltip title="Refresh recent files">
                <IconButton
                  aria-label="Refresh recent files"
                  size="medium"
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <List id={recentFilesListId} aria-label="Recent files">
              {recentFiles.map((file, index) => (
                <React.Fragment key={file.path}>
                  <ListItem
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      // Mock file loading from recent files
                      announcePolite(`Loading recent file: ${file.name}`);
                    }}
                  >
                    <ListItemIcon>
                      <FileIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={file.name}
                      secondary={
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" component="span">
                            {file.lastModified.toLocaleDateString()}
                          </Typography>
                          <Chip
                            label={file.format.toUpperCase()}
                            size="small"
                            variant="outlined"
                          />
                          <Typography variant="body2" component="span" color="text.secondary">
                            {formatFileSize(file.size)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Share file">
                          <IconButton
                            aria-label={`Share ${file.name}`}
                            size="small"
                          >
                            <ShareIcon />
                          </IconButton>
                        </Tooltip>
                        
                        {onDeleteFile && (
                          <Tooltip title="Delete file">
                            <IconButton
                              aria-label={`Delete ${file.name}`}
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFile(file.name);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < recentFiles.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <SecurityIcon color="info" />
            <Box>
              <Typography variant="h3" component="h3" gutterBottom sx={{ fontSize: '1.125rem' }}>
                Security Notice
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Files are processed locally in your browser. Sensitive data in your documents 
                should be handled according to your organization's security policies.
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Hidden file input for loading files */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.json,.yaml,.yml"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
        aria-label="Select file to load"
      />

      {/* File Dialog */}
      <FileDialog
        open={dialogOpen}
        mode={dialogMode}
        onClose={handleCloseDialog}
        onConfirm={handleFileOperation}
        currentFilename={currentDoc?.title || ''}
        loading={loading}
      />

      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1300 }}>
          <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <LinearProgress sx={{ width: 100 }} />
            <Typography variant="body2">
              Processing...
            </Typography>
          </Card>
        </Box>
      )}

      {/* Keyboard Shortcuts Help */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="h4" component="h4" gutterBottom sx={{ fontSize: '1.125rem' }}>
          Keyboard Shortcuts
        </Typography>
        <Typography variant="body2" component="div">
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li><strong>Ctrl+S:</strong> Save document</li>
            <li><strong>Ctrl+O:</strong> Open/Load document</li>
            <li><strong>Tab:</strong> Navigate between buttons</li>
            <li><strong>Enter/Space:</strong> Activate buttons</li>
            <li><strong>Escape:</strong> Close dialogs</li>
          </ul>
        </Typography>
      </Box>
    </Container>
  );
};