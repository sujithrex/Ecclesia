import React, { useState } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Input,
  Label,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { BookRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontWeight: '600',
    fontSize: '14px',
  },
  errorText: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: '12px',
    marginTop: '4px',
  },
  primaryButton: {
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    '&:hover': {
      backgroundColor: '#9a2858',
    },
    '&:active': {
      backgroundColor: '#7f1f47',
    },
  },
});

const CreateCustomBookModal = ({ open, onClose, onSuccess, pastorateId, churchId, isChurchLevel = false }) => {
  const classes = useStyles();
  const [bookName, setBookName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!bookName.trim()) {
      setError('Book name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const userIdStr = localStorage.getItem('userId');
      const userId = userIdStr ? parseInt(userIdStr) : null;

      console.log('CreateCustomBookModal - userId from localStorage:', userIdStr, 'parsed:', userId);
      console.log('CreateCustomBookModal - pastorateId:', pastorateId, 'churchId:', churchId);

      if (!userId) {
        setError('User not logged in. Please log in again.');
        setIsSubmitting(false);
        return;
      }

      let result;
      if (isChurchLevel) {
        console.log('Creating church custom book with:', { churchId, bookName: bookName.trim(), userId });
        result = await window.electron.churchCustomBook.create({
          bookData: {
            churchId,
            bookName: bookName.trim(),
          },
          userId: userId,
        });
      } else {
        console.log('Creating pastorate custom book with:', { pastorateId, bookName: bookName.trim(), userId });
        result = await window.electron.customBook.create({
          bookData: {
            pastorateId,
            bookName: bookName.trim(),
          },
          userId: userId,
        });
      }

      console.log('Create custom book result:', result);

      if (result.success) {
        setBookName('');
        onSuccess && onSuccess();
        onClose();
      } else {
        setError(result.error || 'Failed to create custom book');
      }
    } catch (err) {
      console.error('Error creating custom book:', err);
      setError('An error occurred while creating the book');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setBookName('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(event, data) => !data.open && handleClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Create New Custom Book</DialogTitle>
          <DialogContent className={classes.content}>
            <div className={classes.field}>
              <Label className={classes.label} required>
                Book Name
              </Label>
              <Input
                placeholder="e.g., Building Ledger, Special Fund, etc."
                value={bookName}
                onChange={(e) => {
                  setBookName(e.target.value);
                  setError('');
                }}
                disabled={isSubmitting}
                contentBefore={<BookRegular />}
              />
              {error && <div className={classes.errorText}>{error}</div>}
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              className={classes.primaryButton}
              onClick={handleSubmit}
              disabled={isSubmitting || !bookName.trim()}
            >
              {isSubmitting ? 'Creating...' : 'Create Book'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default CreateCustomBookModal;

