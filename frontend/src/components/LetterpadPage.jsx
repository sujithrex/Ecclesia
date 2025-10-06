import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@fluentui/react-components';
import {
  HomeRegular,
  DocumentRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  SaveRegular,
  PrintRegular,
  DeleteRegular,
  ArrowClockwiseRegular,
  CheckmarkCircleRegular,
  DismissCircleRegular,
  TextBoldRegular,
  TextItalicRegular,
  TextUnderlineRegular,
  TextAlignLeftRegular,
  TextAlignCenterRegular,
  TextAlignRightRegular,
  TextAlignJustifyRegular,
  TableRegular,
  EditRegular
} from '@fluentui/react-icons';
import StatusBar from './StatusBar';
import Breadcrumb from './Breadcrumb';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getSelection, FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND } from 'lexical';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import { generatePuppeteerLetterpadPDF } from '../utils/letterpadReportPuppeteer';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 32px)',
    backgroundColor: '#f8f8f8',
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: '32px 40px 40px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    overflowY: 'auto',
    overflowX: 'hidden',
    minHeight: '0',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#323130',
    margin: '0 0 24px 0',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
    marginBottom: '24px',
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  tableTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#323130',
    margin: '0',
  },
  refreshButton: {
    padding: '8px 16px',
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#9a2858',
    },
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '16px',
  },
  tableHead: {
    backgroundColor: '#f3f2f1',
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    color: '#323130',
    borderBottom: '2px solid #e1dfdd',
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#605e5c',
    borderBottom: '1px solid #e1dfdd',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    padding: '6px 12px',
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#9a2858',
    },
  },
  deleteButton: {
    backgroundColor: '#d13438',
    '&:hover': {
      backgroundColor: '#a72b2e',
    },
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    marginTop: '16px',
  },
  paginationButton: {
    padding: '8px 16px',
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#9a2858',
    },
    '&:disabled': {
      backgroundColor: '#c8c6c4',
      cursor: 'not-allowed',
    },
  },
  paginationInfo: {
    fontSize: '14px',
    color: '#605e5c',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#323130',
    margin: '0 0 24px 0',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  formGroupFull: {
    gridColumn: 'span 2',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#323130',
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #c8c6c4',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    '&:focus': {
      borderColor: '#B5316A',
    },
  },
  textarea: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #c8c6c4',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    resize: 'vertical',
    minHeight: '100px',
    '&:focus': {
      borderColor: '#B5316A',
    },
  },
  lexicalEditor: {
    border: '1px solid #c8c6c4',
    borderRadius: '4px',
    minHeight: '200px',
    fontFamily: 'Vijaya, serif',
    fontSize: '14pt',
    position: 'relative',
    '&:focus-within': {
      borderColor: '#B5316A',
    },
    '& .editor-input': {
      minHeight: '200px',
      outline: 'none',
      fontFamily: 'Vijaya, serif',
      fontSize: '14pt',
      lineHeight: '1.5',
      caretColor: '#000',
      position: 'relative',
      tabSize: '1',
      userSelect: 'text',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      padding: '16px',
    },
    '& .editor-placeholder': {
      color: '#999',
      fontSize: '14pt',
      position: 'absolute',
      top: '16px',
      left: '16px',
      pointerEvents: 'none',
      userSelect: 'none',
    },
    '& .editor-paragraph': {
      margin: '0',
      position: 'relative',
    },
    '& .editor-text-bold': {
      fontWeight: 'bold',
    },
    '& .editor-text-italic': {
      fontStyle: 'italic',
    },
    '& .editor-text-underline': {
      textDecoration: 'underline',
    },
    '& .editor-text-left': {
      textAlign: 'left',
    },
    '& .editor-text-center': {
      textAlign: 'center',
    },
    '& .editor-text-right': {
      textAlign: 'right',
    },
    '& .editor-text-justify': {
      textAlign: 'justify',
    },
    '& table': {
      borderCollapse: 'collapse',
      width: '100%',
      marginTop: '8px',
      marginBottom: '8px',
    },
    '& table td, & table th': {
      border: '1px solid #c8c6c4',
      padding: '8px',
      minWidth: '50px',
    },
    '& table th': {
      backgroundColor: '#f3f2f1',
      fontWeight: 'bold',
    },
  },
  editorToolbar: {
    display: 'flex',
    gap: '8px',
    padding: '8px',
    borderBottom: '1px solid #c8c6c4',
    backgroundColor: '#f8f8f8',
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
  },
  toolbarButton: {
    padding: '6px 12px',
    backgroundColor: 'white',
    color: '#323130',
    border: '1px solid #c8c6c4',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#f3f2f1',
      borderColor: '#B5316A',
    },
    '&:active': {
      backgroundColor: '#e1dfdd',
    },
  },
  editorContainer: {
    border: '1px solid #c8c6c4',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  formButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'flex-end',
  },
  submitButton: {
    padding: '12px 24px',
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#9a2858',
    },
    '&:disabled': {
      backgroundColor: '#c8c6c4',
      cursor: 'not-allowed',
    },
  },
  errorText: {
    color: '#d13438',
    fontSize: '12px',
    marginTop: '4px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#605e5c',
    fontSize: '14px',
  },
  loadingState: {
    textAlign: 'center',
    padding: '40px',
    color: '#605e5c',
    fontSize: '14px',
  },
  notification: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '16px 20px',
    borderRadius: '4px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    zIndex: 1001,
    maxWidth: '400px',
    fontSize: '14px',
    fontWeight: '500',
    animation: 'slideIn 0.3s ease-out',
  },
  '@keyframes slideIn': {
    from: {
      transform: 'translateX(100%)',
      opacity: 0,
    },
    to: {
      transform: 'translateX(0)',
      opacity: 1,
    }
  },
  notificationSuccess: {
    backgroundColor: '#DFF6DD',
    color: '#107C10',
    border: '1px solid #92C353',
  },
  notificationError: {
    backgroundColor: '#FDE7E9',
    color: '#D13438',
    border: '1px solid #F7B9B9',
  },
});

// Lexical theme configuration
const theme = {
  paragraph: 'editor-paragraph',
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
    underline: 'editor-text-underline',
  },
  textAlign: {
    left: 'editor-text-left',
    center: 'editor-text-center',
    right: 'editor-text-right',
    justify: 'editor-text-justify',
  },
};

// Plugin to load HTML content into editor
function LoadContentPlugin({ htmlContent }) {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    if (htmlContent) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(htmlContent, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);

        // Clear existing content
        const root = $getRoot();
        root.clear();

        // Insert new content
        root.append(...nodes);
      });
    }
  }, [htmlContent, editor]);

  return null;
}

// Toolbar Plugin Component
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const styles = useStyles();
  const [lineSpacing, setLineSpacing] = React.useState('1.5');
  const [paragraphSpacing, setParagraphSpacing] = React.useState('1');

  const formatText = (format) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatAlignment = (alignment) => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment);
  };

  const insertTable = () => {
    editor.dispatchCommand(INSERT_TABLE_COMMAND, { rows: '3', columns: '3' });
  };

  const handleLineSpacingChange = (e) => {
    const value = e.target.value;
    setLineSpacing(value);

    editor.update(() => {
      const root = $getRoot();
      const selection = $getSelection();
      if (selection) {
        const nodes = selection.getNodes();
        nodes.forEach(node => {
          let parent = node.getParent();
          while (parent && parent.getType() !== 'paragraph' && parent.getType() !== 'root') {
            parent = parent.getParent();
          }
          if (parent && parent.getType() === 'paragraph') {
            const currentStyle = parent.getStyle() || '';
            const newStyle = currentStyle.replace(/line-height:\s*[^;]+;?/g, '') + `line-height: ${value};`;
            parent.setStyle(newStyle.trim());
          }
        });
      }
    });
  };

  const handleParagraphSpacingChange = (e) => {
    const value = e.target.value;
    setParagraphSpacing(value);

    editor.update(() => {
      const root = $getRoot();
      const selection = $getSelection();
      if (selection) {
        const nodes = selection.getNodes();
        nodes.forEach(node => {
          let parent = node.getParent();
          while (parent && parent.getType() !== 'paragraph' && parent.getType() !== 'root') {
            parent = parent.getParent();
          }
          if (parent && parent.getType() === 'paragraph') {
            const currentStyle = parent.getStyle() || '';
            const newStyle = currentStyle.replace(/margin-bottom:\s*[^;]+;?/g, '') + `margin-bottom: ${value}em;`;
            parent.setStyle(newStyle.trim());
          }
        });
      }
    });
  };

  return (
    <div className={styles.editorToolbar}>
      <button
        className={styles.toolbarButton}
        onClick={() => formatText('bold')}
        type="button"
        title="Bold"
      >
        <TextBoldRegular fontSize={16} />
        Bold
      </button>
      <button
        className={styles.toolbarButton}
        onClick={() => formatText('italic')}
        type="button"
        title="Italic"
      >
        <TextItalicRegular fontSize={16} />
        Italic
      </button>
      <button
        className={styles.toolbarButton}
        onClick={() => formatText('underline')}
        type="button"
        title="Underline"
      >
        <TextUnderlineRegular fontSize={16} />
        Underline
      </button>

      <div style={{ width: '1px', height: '24px', backgroundColor: '#d1d1d1', margin: '0 8px' }}></div>

      <button
        className={styles.toolbarButton}
        onClick={() => formatAlignment('left')}
        type="button"
        title="Align Left"
      >
        <TextAlignLeftRegular fontSize={16} />
      </button>
      <button
        className={styles.toolbarButton}
        onClick={() => formatAlignment('center')}
        type="button"
        title="Align Center"
      >
        <TextAlignCenterRegular fontSize={16} />
      </button>
      <button
        className={styles.toolbarButton}
        onClick={() => formatAlignment('right')}
        type="button"
        title="Align Right"
      >
        <TextAlignRightRegular fontSize={16} />
      </button>
      <button
        className={styles.toolbarButton}
        onClick={() => formatAlignment('justify')}
        type="button"
        title="Justify"
      >
        <TextAlignJustifyRegular fontSize={16} />
      </button>

      <div style={{ width: '1px', height: '24px', backgroundColor: '#d1d1d1', margin: '0 8px' }}></div>

      <button
        className={styles.toolbarButton}
        onClick={insertTable}
        type="button"
        title="Insert Table"
      >
        <TableRegular fontSize={16} />
        Table
      </button>

      <div style={{ width: '1px', height: '24px', backgroundColor: '#d1d1d1', margin: '0 8px' }}></div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: '12px', color: '#605e5c' }}>Line:</label>
        <input
          type="number"
          value={lineSpacing}
          onChange={handleLineSpacingChange}
          step="0.1"
          min="1"
          max="3"
          style={{
            width: '50px',
            padding: '4px',
            border: '1px solid #c8c6c4',
            borderRadius: '4px',
            fontSize: '12px'
          }}
          title="Line Spacing"
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: '12px', color: '#605e5c' }}>Para:</label>
        <input
          type="number"
          value={paragraphSpacing}
          onChange={handleParagraphSpacingChange}
          step="0.1"
          min="0"
          max="3"
          style={{
            width: '50px',
            padding: '4px',
            border: '1px solid #c8c6c4',
            borderRadius: '4px',
            fontSize: '12px'
          }}
          title="Paragraph Spacing"
        />
      </div>
    </div>
  );
}

const LetterpadPage = ({
  user,
  onLogout,
  onProfileClick,
  currentPastorate,
  userPastorates,
  onPastorateChange,
  onCreatePastorate,
  onEditPastorate,
  onDeletePastorate,
  currentChurch,
  userChurches,
  onChurchChange,
  onCreateChurch,
  onEditChurch,
  onDeleteChurch
}) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [notification, setNotification] = useState(null);
  const [letterpads, setLetterpads] = useState([]);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingLetterpadId, setEditingLetterpadId] = useState(null);

  const itemsPerPage = 8;

  // Form state
  const [formData, setFormData] = useState({
    letterpad_number: '',
    letter_date: new Date().toISOString().split('T')[0],
    subject: '',
    content: '',
    rev_name: '',
    rev_designation: '',
    parsonage_address: ''
  });

  // Settings state
  const [settings, setSettings] = useState({
    default_rev_name: '',
    default_rev_designation: '',
    default_parsonage_address: ''
  });

  // Show notification helper
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Lexical editor initial config
  const initialConfig = {
    namespace: 'LetterpadEditor',
    theme,
    nodes: [TableNode, TableCellNode, TableRowNode],
    onError: (error) => {
      console.error('Lexical error:', error);
    }
  };

  // Load letterpads on mount and when page changes
  useEffect(() => {
    if (currentPastorate && user) {
      loadLetterpadData();
      loadSettings();
    }
  }, [currentPastorate?.id, user?.id, currentPage]);

  const loadLetterpadData = async () => {
    setLoading(true);
    try {
      // Generate next letterpad number
      const numberResult = await window.electron.letterpad.getNextNumber({
        pastorateId: currentPastorate.id,
        userId: user.id
      });
      
      if (numberResult.success) {
        setFormData(prev => ({
          ...prev,
          letterpad_number: numberResult.letterpadNumber
        }));
      }

      // Load letterpads with pagination
      const letterpadResult = await window.electron.letterpad.getByPastorate({
        pastorateId: currentPastorate.id,
        userId: user.id,
        page: currentPage,
        limit: itemsPerPage
      });
      
      if (letterpadResult.success) {
        setLetterpads(letterpadResult.letterpads || []);
        setTotalPages(letterpadResult.pagination?.totalPages || 1);
      } else {
        console.error('Error loading letterpads:', letterpadResult.error);
        showNotification(`Error loading letterpads: ${letterpadResult.error}`, 'error');
      }
    } catch (error) {
      console.error('Error loading letterpad data:', error);
      showNotification('Error loading letterpad data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    setSettingsLoading(true);
    try {
      const result = await window.electron.letterpad.getSettings({
        pastorateId: currentPastorate.id,
        userId: user.id
      });

      if (result.success && result.settings) {
        setSettings(result.settings);
        setFormData(prev => ({
          ...prev,
          rev_name: result.settings.default_rev_name || '',
          rev_designation: result.settings.default_rev_designation || '',
          parsonage_address: result.settings.default_parsonage_address || ''
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!currentPastorate || !user) return;

    try {
      const settingsData = {
        default_rev_name: formData.rev_name,
        default_rev_designation: formData.rev_designation,
        default_parsonage_address: formData.parsonage_address
      };

      const result = await window.electron.letterpad.updateSettings({
        pastorateId: currentPastorate.id,
        settingsData,
        userId: user.id
      });

      if (result.success) {
        setSettings(prev => ({
          ...prev,
          ...settingsData
        }));
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRefresh = () => {
    loadLetterpadData();
  };

  const handleContentChange = (editorState, editor) => {
    editorState.read(() => {
      // Generate HTML from editor content
      const htmlContent = $generateHtmlFromNodes(editor, null);
      setFormData(prev => ({
        ...prev,
        content: htmlContent
      }));
    });
  };

  const handleEditLetterpad = (letterpad) => {
    setEditingLetterpadId(letterpad.id);
    setFormData({
      letterpad_number: letterpad.letterpad_number,
      letter_date: letterpad.letter_date,
      subject: letterpad.subject || '',
      content: letterpad.content || '',
      rev_name: letterpad.rev_name || '',
      rev_designation: letterpad.rev_designation || '',
      parsonage_address: letterpad.parsonage_address || ''
    });

    // Scroll to form
    window.scrollTo({ top: document.querySelector('.letterpad-form')?.offsetTop || 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingLetterpadId(null);
    setFormData({
      letterpad_number: '',
      letter_date: new Date().toISOString().split('T')[0],
      subject: '',
      content: '',
      rev_name: settings.default_rev_name || '',
      rev_designation: settings.default_rev_designation || '',
      parsonage_address: settings.default_parsonage_address || ''
    });
    loadLetterpadData();
  };

  const handleSave = async () => {
    if (!currentPastorate || !user) {
      showNotification('User or pastorate not selected', 'error');
      return;
    }

    // Validate required fields
    const requiredFields = ['letterpad_number', 'letter_date', 'content', 'rev_name', 'rev_designation'];
    const missingFields = requiredFields.filter(field => !formData[field]?.trim());

    if (missingFields.length > 0) {
      showNotification(`Please fill in: ${missingFields.join(', ').replace(/_/g, ' ')}`, 'error');
      return;
    }

    setSubmitting(true);
    try {
      const letterpadData = {
        ...formData,
        pastorate_id: currentPastorate.id
      };

      let result;
      if (editingLetterpadId) {
        // Update existing letterpad
        result = await window.electron.letterpad.update({
          letterpadId: editingLetterpadId,
          letterpadData,
          userId: user.id
        });
      } else {
        // Create new letterpad
        result = await window.electron.letterpad.create({
          letterpadData,
          userId: user.id
        });
      }

      if (result.success) {
        showNotification(editingLetterpadId ? 'Letterpad updated successfully!' : 'Letterpad saved successfully!', 'success');

        // Save settings for future use
        await saveSettings();

        // Reset form
        setEditingLetterpadId(null);
        setFormData({
          letterpad_number: '',
          letter_date: new Date().toISOString().split('T')[0],
          subject: '',
          content: '',
          rev_name: settings.default_rev_name || '',
          rev_designation: settings.default_rev_designation || '',
          parsonage_address: settings.default_parsonage_address || ''
        });

        // Reload data
        await loadLetterpadData();
      } else {
        showNotification(result.error || 'Failed to save letterpad', 'error');
      }
    } catch (error) {
      console.error('Error saving letterpad:', error);
      showNotification('Failed to save letterpad', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!currentPastorate || !user) {
      showNotification('User or pastorate not selected', 'error');
      return;
    }

    // Validate required fields
    const requiredFields = ['letterpad_number', 'letter_date', 'content', 'rev_name', 'rev_designation'];
    const missingFields = requiredFields.filter(field => !formData[field]?.trim());

    if (missingFields.length > 0) {
      showNotification(`Please fill in: ${missingFields.join(', ').replace(/_/g, ' ')}`, 'error');
      return;
    }

    setSubmitting(true);
    try {
      let letterpadId = editingLetterpadId;

      // If editing, update the existing letterpad; otherwise create new
      if (editingLetterpadId) {
        // Update existing letterpad
        const letterpadData = {
          ...formData,
          pastorate_id: currentPastorate.id
        };

        const updateResult = await window.electron.letterpad.update({
          letterpadId: editingLetterpadId,
          letterpadData,
          userId: user.id
        });

        if (!updateResult.success) {
          showNotification(`Error updating letterpad: ${updateResult.error}`, 'error');
          return;
        }
      } else {
        // Create new letterpad
        const letterpadData = {
          ...formData,
          pastorate_id: currentPastorate.id
        };

        const saveResult = await window.electron.letterpad.create({
          letterpadData,
          userId: user.id
        });

        if (!saveResult.success) {
          showNotification(`Error saving letterpad: ${saveResult.error}`, 'error');
          return;
        }

        letterpadId = saveResult.letterpadId;
      }

      // Fetch the letterpad data for PDF generation
      const letterpadResult = await window.electron.letterpad.getById({
        letterpadId: letterpadId,
        userId: user.id
      });

      if (!letterpadResult.success) {
        showNotification('Error fetching letterpad data for PDF', 'error');
        return;
      }

      // Load pastorate settings for PDF
      const settingsResult = await window.electron.letterpad.getSettings({
        pastorateId: currentPastorate.id,
        userId: user.id
      });

      const pastorateSettings = settingsResult.success ? settingsResult.settings : {};

      // Then generate PDF using the utility function
      const pdfResult = await generatePuppeteerLetterpadPDF(
        letterpadResult.letterpad,
        currentPastorate,
        pastorateSettings,
        'view'
      );

      if (pdfResult.success) {
        showNotification('PDF generated and opened successfully!', 'success');

        // Save settings and reset form
        await saveSettings();
        setFormData({
          letterpad_number: '',
          letter_date: new Date().toISOString().split('T')[0],
          subject: '',
          content: '',
          rev_name: settings.default_rev_name || '',
          rev_designation: settings.default_rev_designation || '',
          parsonage_address: settings.default_parsonage_address || ''
        });

        // Reload data
        await loadLetterpadData();
      } else {
        showNotification(pdfResult.error || 'Failed to generate PDF', 'error');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      showNotification('Failed to generate PDF', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintLetterpad = async (letterpad) => {
    try {
      // Load pastorate settings for PDF
      const settingsResult = await window.electron.letterpad.getSettings({
        pastorateId: currentPastorate.id,
        userId: user.id
      });

      const pastorateSettings = settingsResult.success ? settingsResult.settings : {};

      // Generate PDF using the utility function
      const result = await generatePuppeteerLetterpadPDF(
        letterpad,
        currentPastorate,
        pastorateSettings,
        'view'
      );

      if (result.success) {
        showNotification('PDF generated and opened successfully!', 'success');
      } else {
        showNotification(`Error printing letterpad: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error printing letterpad:', error);
      showNotification('Error printing letterpad', 'error');
    }
  };

  const handleDeleteLetterpad = async (letterpadId) => {
    try {
      const result = await window.electron.letterpad.delete({
        letterpadId,
        userId: user.id
      });

      if (result.success) {
        showNotification('Letterpad deleted successfully', 'success');
        loadLetterpadData();
      } else {
        showNotification(`Error deleting letterpad: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting letterpad:', error);
      showNotification('Error deleting letterpad', 'error');
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className={styles.container}>
      {/* Notification */}
      {notification && (
        <div className={`${styles.notification} ${
          notification.type === 'success'
            ? styles.notificationSuccess
            : styles.notificationError
        }`}>
          {notification.type === 'success' ? (
            <CheckmarkCircleRegular />
          ) : (
            <DismissCircleRegular />
          )}
          {notification.message}
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <Breadcrumb
        pageTitle="Letterpad"
        breadcrumbs={[
          {
            label: `${currentPastorate?.pastorate_short_name || 'Pastorate'} Dashboard`,
            icon: <HomeRegular />,
            onClick: () => navigate('/pastorate-dashboard')
          },
          {
            label: 'Letterpad',
            current: true
          }
        ]}
        onNavigate={(path) => navigate(path)}
      />

      {/* Content */}
      <div className={styles.content}>

        {/* Previous Records Table */}
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>Previous Records</h2>
            <button className={styles.refreshButton} onClick={handleRefresh}>
              <ArrowClockwiseRegular fontSize={16} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className={styles.loadingState}>Loading letterpads...</div>
          ) : letterpads.length === 0 ? (
            <div className={styles.emptyState}>No letterpads found</div>
          ) : (
            <>
              <table className={styles.table}>
                <thead className={styles.tableHead}>
                  <tr>
                    <th className={styles.th}>Number</th>
                    <th className={styles.th}>Date</th>
                    <th className={styles.th}>Subject</th>
                    <th className={styles.th}>Rev. Name</th>
                    <th className={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {letterpads.map((letterpad) => (
                    <tr key={letterpad.id}>
                      <td className={styles.td}>{letterpad.letterpad_number}</td>
                      <td className={styles.td}>{letterpad.letter_date}</td>
                      <td className={styles.td}>
                        {letterpad.subject ?
                          (letterpad.subject.length > 30
                            ? letterpad.subject.substring(0, 30) + '...'
                            : letterpad.subject) :
                          '-'}
                      </td>
                      <td className={styles.td}>{letterpad.rev_name}</td>
                      <td className={styles.td}>
                        <div className={styles.actionButtons}>
                          <button
                            className={styles.actionButton}
                            onClick={() => handleEditLetterpad(letterpad)}
                          >
                            <EditRegular fontSize={14} />
                            Edit
                          </button>
                          <button
                            className={styles.actionButton}
                            onClick={() => handlePrintLetterpad(letterpad)}
                          >
                            <PrintRegular fontSize={14} />
                            Print
                          </button>
                          <button
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => handleDeleteLetterpad(letterpad.id)}
                          >
                            <DeleteRegular fontSize={14} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className={styles.pagination}>
                <button
                  className={styles.paginationButton}
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeftRegular fontSize={16} />
                  Previous
                </button>
                <span className={styles.paginationInfo}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className={styles.paginationButton}
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRightRegular fontSize={16} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Generate Letterpad Form */}
        <div className={`${styles.formContainer} letterpad-form`}>
          <h2 className={styles.formTitle}>
            {editingLetterpadId ? 'Edit Letterpad' : 'Generate Letterpad'}
          </h2>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Letterpad Number *</label>
              <input
                type="text"
                name="letterpad_number"
                value={formData.letterpad_number}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="2025/A/01"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Letter Date *</label>
              <input
                type="date"
                name="letter_date"
                value={formData.letter_date}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Rev. Name *</label>
              <input
                type="text"
                name="rev_name"
                value={formData.rev_name}
                onChange={handleInputChange}
                onBlur={saveSettings}
                className={styles.input}
                placeholder="Rev. T SAMUEL"
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>Rev. Designation *</label>
              <textarea
                name="rev_designation"
                value={formData.rev_designation}
                onChange={handleInputChange}
                onBlur={saveSettings}
                className={styles.textarea}
                placeholder="Pastorate Chairman&#10;Tenkasi North Zion Nagar Pastorate"
                rows={2}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>Parsonage Address</label>
              <textarea
                name="parsonage_address"
                value={formData.parsonage_address}
                onChange={handleInputChange}
                onBlur={saveSettings}
                className={styles.textarea}
                placeholder="Christ Church Parsonage&#10;14, Zion Church Street,&#10;Samathanapuram&#10;Tenkasi&#10;Ph:75388122218"
                rows={4}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Letter subject"
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>Letter Content *</label>
              <div className={styles.editorContainer}>
                <LexicalComposer initialConfig={initialConfig} key={editingLetterpadId || 'new'}>
                  <LoadContentPlugin htmlContent={formData.content} />
                  <ToolbarPlugin />
                  <div className={styles.lexicalEditor}>
                    <RichTextPlugin
                      contentEditable={<ContentEditable className="editor-input" />}
                      placeholder={<div className="editor-placeholder">Enter your letter content here...</div>}
                      ErrorBoundary={LexicalErrorBoundary}
                    />
                    <OnChangePlugin onChange={handleContentChange} />
                    <HistoryPlugin />
                    <AutoFocusPlugin />
                    <TablePlugin />
                  </div>
                </LexicalComposer>
              </div>
            </div>
          </div>

          <div className={styles.formButtons}>
            {editingLetterpadId && (
              <button
                className={styles.submitButton}
                onClick={handleCancelEdit}
                disabled={submitting}
                style={{ backgroundColor: '#605e5c' }}
              >
                <DismissCircleRegular fontSize={16} />
                Cancel Edit
              </button>
            )}
            <button
              className={styles.submitButton}
              onClick={handleSave}
              disabled={submitting}
            >
              <SaveRegular fontSize={16} />
              {editingLetterpadId ? 'Update Letterpad' : 'Save Letterpad'}
            </button>
            <button
              className={styles.submitButton}
              onClick={handleGeneratePDF}
              disabled={submitting}
            >
              <PrintRegular fontSize={16} />
              Generate PDF
            </button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        user={user}
        onLogout={onLogout}
        onProfileClick={onProfileClick}
        currentPastorate={currentPastorate}
        userPastorates={userPastorates}
        onPastorateChange={onPastorateChange}
        onCreatePastorate={onCreatePastorate}
        onEditPastorate={onEditPastorate}
        onDeletePastorate={onDeletePastorate}
        currentChurch={currentChurch}
        userChurches={userChurches}
        onChurchChange={onChurchChange}
        onCreateChurch={onCreateChurch}
        onEditChurch={onEditChurch}
        onDeleteChurch={onDeleteChurch}
        currentView="letterpad"
      />
    </div>
  );
};

export default LetterpadPage;