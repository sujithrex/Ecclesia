import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogActions,
  Button,
  Input,
  Label,
  Field,
  Textarea,
  Combobox,
  Option,
  MessageBar,
  MessageBarBody,
  Spinner
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';

const CreateFamilyModal = ({
  isOpen,
  onClose,
  onSuccess,
  user,
  currentArea,
  currentChurch,
  editMode = false,
  initialData = null
}) => {
  // Form state
  const [formData, setFormData] = useState({
    family_number: '',
    respect: 'mr',
    family_name: '',
    family_address: '',
    family_phone: '',
    family_email: '',
    layout_number: '',
    notes: '',
    prayer_points: '',
    prayer_cell_id: null
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [prayerCells, setPrayerCells] = useState([]);
  const [loadingPrayerCells, setLoadingPrayerCells] = useState(false);

  const respectOptions = [
    { value: 'mr', label: 'Mr.' },
    { value: 'mrs', label: 'Mrs.' },
    { value: 'ms', label: 'Ms.' },
    { value: 'master', label: 'Master' },
    { value: 'rev', label: 'Rev.' },
    { value: 'dr', label: 'Dr.' },
    { value: 'er', label: 'Er.' },
    { value: 'sis', label: 'Sis.' },
    { value: 'bishop', label: 'Bishop' }
  ];

  // Load prayer cells when modal opens
  useEffect(() => {
    if (isOpen && currentChurch && user) {
      loadPrayerCells();
    }
  }, [isOpen, currentChurch, user]);

  // Initialize form data for edit mode
  useEffect(() => {
    if (isOpen && editMode && initialData) {
      setFormData({
        family_number: initialData.family_number || '',
        respect: initialData.respect || 'mr',
        family_name: initialData.family_name || '',
        family_address: initialData.family_address || '',
        family_phone: initialData.family_phone || '',
        family_email: initialData.family_email || '',
        layout_number: initialData.layout_number || '',
        notes: initialData.notes || '',
        prayer_points: initialData.prayer_points || '',
        prayer_cell_id: initialData.prayer_cell_id || null
      });
    } else if (isOpen && !editMode) {
      // Reset form for create mode
      setFormData({
        family_number: '',
        respect: 'mr',
        family_name: '',
        family_address: '',
        family_phone: '',
        family_email: '',
        layout_number: '',
        notes: '',
        prayer_points: '',
        prayer_cell_id: null
      });
    }
  }, [isOpen, editMode, initialData]);

  const loadPrayerCells = async () => {
    setLoadingPrayerCells(true);
    try {
      const result = await window.electron.prayerCell.getByChurch({
        churchId: currentChurch.id,
        userId: user.id
      });
      
      if (result.success) {
        setPrayerCells(result.prayerCells || []);
      } else {
        console.error('Failed to load prayer cells:', result.error);
        setPrayerCells([]);
      }
    } catch (error) {
      console.error('Error loading prayer cells:', error);
      setPrayerCells([]);
    } finally {
      setLoadingPrayerCells(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.family_number.trim()) {
      newErrors.family_number = 'Family number is required';
    } else if (!/^\d{3}$/.test(formData.family_number.trim())) {
      newErrors.family_number = 'Family number must be a 3-digit number';
    }

    if (!formData.respect) {
      newErrors.respect = 'Respect is required';
    }

    if (!formData.family_name.trim()) {
      newErrors.family_name = 'Family name is required';
    }

    if (!formData.layout_number.trim()) {
      newErrors.layout_number = 'Layout number is required';
    } else if (!/^\d{3}$/.test(formData.layout_number.trim())) {
      newErrors.layout_number = 'Layout number must be a 3-digit number';
    }

    if (formData.family_email.trim() && !/\S+@\S+\.\S+/.test(formData.family_email.trim())) {
      newErrors.family_email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const familyData = {
        ...formData,
        family_number: formData.family_number.trim(),
        family_name: formData.family_name.trim(),
        family_address: formData.family_address.trim(),
        family_phone: formData.family_phone.trim(),
        family_email: formData.family_email.trim(),
        layout_number: formData.layout_number.trim(),
        notes: formData.notes.trim(),
        prayer_points: formData.prayer_points.trim(),
        prayer_cell_id: formData.prayer_cell_id || null
      };

      let result;
      if (editMode) {
        result = await window.electron.family.update({
          familyId: initialData.id,
          familyData,
          userId: user.id
        });
      } else {
        result = await window.electron.family.create({
          areaId: currentArea.id,
          familyData,
          userId: user.id
        });
      }

      if (result.success) {
        onSuccess(result.family);
        handleClose();
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} family:`, error);
      setErrors({ general: `Failed to ${editMode ? 'update' : 'create'} family` });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      family_number: '',
      respect: 'mr',
      family_name: '',
      family_address: '',
      family_phone: '',
      family_email: '',
      layout_number: '',
      notes: '',
      prayer_points: '',
      prayer_cell_id: null
    });
    setErrors({});
    setLoading(false);
    onClose();
  };

  const getPrayerCellDisplayName = (prayerCell) => {
    return `${prayerCell.prayer_cell_identity} - ${prayerCell.prayer_cell_name}`;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(event, data) => !data.open && handleClose()}>
      <DialogSurface style={{ maxWidth: '600px', width: '90vw' }}>
        <DialogTitle
          action={
            <Button
              appearance="subtle"
              aria-label="close"
              icon={<DismissRegular />}
              onClick={handleClose}
            />
          }
        >
          {editMode ? 'Edit Family' : 'Create Family'}
        </DialogTitle>
        <DialogContent>
          <DialogBody>
            {errors.general && (
              <MessageBar intent="error" style={{ marginBottom: '16px' }}>
                <MessageBarBody>{errors.general}</MessageBarBody>
              </MessageBar>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Basic Information Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: '16px' }}>
                <Field
                  label="Family Number"
                  required
                  validationState={errors.family_number ? 'error' : 'none'}
                  validationMessage={errors.family_number}
                >
                  <Input
                    value={formData.family_number}
                    onChange={(e) => handleInputChange('family_number', e.target.value)}
                    placeholder="001"
                    maxLength={3}
                  />
                </Field>

                <Field
                  label="Respect"
                  required
                  validationState={errors.respect ? 'error' : 'none'}
                  validationMessage={errors.respect}
                >
                  <Combobox
                    value={formData.respect}
                    selectedOptions={[formData.respect]}
                    onOptionSelect={(event, data) => handleInputChange('respect', data.optionValue)}
                    placeholder="Select respect"
                  >
                    {respectOptions.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Combobox>
                </Field>

                <Field
                  label="Family Name"
                  required
                  validationState={errors.family_name ? 'error' : 'none'}
                  validationMessage={errors.family_name}
                >
                  <Input
                    value={formData.family_name}
                    onChange={(e) => handleInputChange('family_name', e.target.value)}
                    placeholder="Enter family name"
                  />
                </Field>
              </div>

              {/* Contact Information */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Field
                  label="Phone Number"
                  validationState={errors.family_phone ? 'error' : 'none'}
                  validationMessage={errors.family_phone}
                >
                  <Input
                    value={formData.family_phone}
                    onChange={(e) => handleInputChange('family_phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </Field>

                <Field
                  label="Email Address"
                  validationState={errors.family_email ? 'error' : 'none'}
                  validationMessage={errors.family_email}
                >
                  <Input
                    value={formData.family_email}
                    onChange={(e) => handleInputChange('family_email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </Field>
              </div>

              {/* Address */}
              <Field
                label="Address"
                validationState={errors.family_address ? 'error' : 'none'}
                validationMessage={errors.family_address}
              >
                <Textarea
                  value={formData.family_address}
                  onChange={(e) => handleInputChange('family_address', e.target.value)}
                  placeholder="Enter family address"
                  rows={3}
                />
              </Field>

              {/* Layout Number and Prayer Cell */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                <Field
                  label="Layout Number"
                  required
                  validationState={errors.layout_number ? 'error' : 'none'}
                  validationMessage={errors.layout_number}
                >
                  <Input
                    value={formData.layout_number}
                    onChange={(e) => handleInputChange('layout_number', e.target.value)}
                    placeholder="001"
                    maxLength={3}
                  />
                </Field>

                <Field label="Prayer Cell (Optional)">
                  {loadingPrayerCells ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
                      <Spinner size="tiny" />
                      <span style={{ fontSize: '14px', color: '#605e5c' }}>Loading prayer cells...</span>
                    </div>
                  ) : (
                    <Combobox
                      value={formData.prayer_cell_id ? String(formData.prayer_cell_id) : ''}
                      selectedOptions={formData.prayer_cell_id ? [String(formData.prayer_cell_id)] : []}
                      onOptionSelect={(event, data) => {
                        const value = data.optionValue === '' ? null : Number(data.optionValue);
                        handleInputChange('prayer_cell_id', value);
                      }}
                      placeholder="Select a prayer cell (optional)"
                    >
                      <Option value="">No Prayer Cell</Option>
                      {prayerCells.map((prayerCell) => (
                        <Option key={prayerCell.id} value={String(prayerCell.id)}>
                          {getPrayerCellDisplayName(prayerCell)}
                        </Option>
                      ))}
                    </Combobox>
                  )}
                </Field>
              </div>

              {/* Notes and Prayer Points */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Field label="Notes">
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Enter any notes about this family"
                    rows={4}
                  />
                </Field>

                <Field label="Prayer Points">
                  <Textarea
                    value={formData.prayer_points}
                    onChange={(e) => handleInputChange('prayer_points', e.target.value)}
                    placeholder="Enter prayer points for this family"
                    rows={4}
                  />
                </Field>
              </div>
            </form>
          </DialogBody>
          <DialogActions>
            <Button appearance="secondary" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              appearance="primary"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? <Spinner size="tiny" /> : (editMode ? 'Update Family' : 'Create Family')}
            </Button>
          </DialogActions>
        </DialogContent>
      </DialogSurface>
    </Dialog>
  );
};

export default CreateFamilyModal;