import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { makeStyles } from '@fluentui/react-components';
import {
  Button,
  Input,
  Label,
  Field,
  Textarea,
  Combobox,
  Option,
  MessageBar,
  MessageBarBody,
  Spinner,
  Text
} from '@fluentui/react-components';
import {
  HomeRegular,
  ArrowLeftRegular
} from '@fluentui/react-icons';
import StatusBar from './StatusBar';
import Breadcrumb from './Breadcrumb';

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
    padding: '20px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    overflowY: 'auto',
    overflowX: 'hidden',
    minHeight: '0',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#323130',
    margin: '0 0 8px 0',
  },
  pageSubtitle: {
    fontSize: '16px',
    color: '#605e5c',
    margin: '0 0 24px 0',
  },
  formGrid3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '16px',
  },
  formGrid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  formGrid1: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '16px',
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '24px',
    borderTop: '1px solid #e1dfdd',
    gap: '16px',
  },
  leftButtons: {
    display: 'flex',
    gap: '12px',
  },
  rightButtons: {
    display: 'flex',
    gap: '12px',
  },
  saveButton: {
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    '&:hover': {
      backgroundColor: '#A12B5E',
    },
  },
  saveAndBackButton: {
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    '&:hover': {
      backgroundColor: '#A12B5E',
    },
  },
  saveContinueButton: {
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    '&:hover': {
      backgroundColor: '#A12B5E',
    },
  },
  cancelButton: {
    backgroundColor: '#f3f2f1',
    color: '#323130',
    border: '1px solid #8a8886',
    '&:hover': {
      backgroundColor: '#edebe9',
    },
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    color: '#605e5c',
  },
  errorContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    color: '#d13438',
    textAlign: 'center',
  }
});

const CreateFamilyPage = ({
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
  const { areaId, familyId } = useParams();
  const location = useLocation();
  
  const editMode = !!familyId;
  const initialData = location.state?.familyData || null;

  // State
  const [currentArea, setCurrentArea] = useState(null);
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
  const [loadingArea, setLoadingArea] = useState(true);
  const [savedFamilyId, setSavedFamilyId] = useState(null);

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

  // Load area and auto-numbers when component mounts
  useEffect(() => {
    if (areaId && user) {
      loadAreaInfo();
    }
  }, [areaId, user?.id]);

  // Initialize form data for edit mode
  useEffect(() => {
    if (editMode && initialData) {
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
    } else if (!editMode && currentArea) {
      // Load auto-numbers for create mode
      loadAutoNumbers();
    }
  }, [editMode, initialData, currentArea]);

  // Load prayer cells when area is loaded
  useEffect(() => {
    if (currentArea && currentChurch && user) {
      loadPrayerCells();
    }
  }, [currentArea, currentChurch, user]);

  const loadAreaInfo = async () => {
    setLoadingArea(true);
    try {
      if (!currentChurch) {
        navigate('/dashboard');
        return;
      }

      // Load areas from current church to find the specific area
      const areasResult = await window.electron.area.getByChurch({
        churchId: currentChurch.id,
        userId: user.id
      });

      if (areasResult.success) {
        const area = areasResult.areas.find(a => a.id === parseInt(areaId));
        if (area) {
          setCurrentArea(area);
        } else {
          navigate('/dashboard');
        }
      } else {
        console.error('Failed to load areas:', areasResult.error);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error loading area info:', error);
      navigate('/dashboard');
    } finally {
      setLoadingArea(false);
    }
  };

  const loadAutoNumbers = async () => {
    try {
      const result = await window.electron.family.getAutoNumbers({
        areaId: parseInt(areaId),
        userId: user.id
      });

      if (result.success) {
        setFormData(prev => ({
          ...prev,
          family_number: result.familyNumber,
          layout_number: result.layoutNumber
        }));
      } else {
        console.error('Failed to load auto numbers:', result.error);
      }
    } catch (error) {
      console.error('Error loading auto numbers:', error);
    }
  };

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

    if (!formData.family_phone.trim()) {
      newErrors.family_phone = 'Phone number is required';
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

  const handleSave = async (action) => {
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
          familyId: parseInt(familyId),
          familyData,
          userId: user.id
        });
      } else {
        result = await window.electron.family.create({
          areaId: parseInt(areaId),
          familyData,
          userId: user.id
        });
      }

      if (result.success) {
        // Store the family ID for new families
        const currentFamilyId = editMode ? parseInt(familyId) : result.family.id;
        if (!editMode && result.family && result.family.id) {
          setSavedFamilyId(result.family.id);
        }

        switch (action) {
          case 'save':
            // Just save and stay on page
            setErrors({ success: `Family ${editMode ? 'updated' : 'created'} successfully` });
            break;
          case 'save-and-back':
            if (editMode) {
              navigate(`/area/${areaId}/family/${familyId}`);
            } else {
              navigate(`/area/${areaId}`);
            }
            break;
          case 'save-and-continue':
            // Save and clear form for new entry
            setErrors({ success: 'Family created successfully' });
            // Reset form and load new auto numbers
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
            loadAutoNumbers();
            break;
          case 'save-and-edit-family-head':
            // Create family head member and navigate to edit member page
            if (!editMode && currentFamilyId) {
              try {
                // Create family head member with basic info from family
                const familyHeadData = {
                  member_number: '01',
                  respect: formData.respect,
                  name: formData.family_name.trim(),
                  relation: 'Family Head',
                  sex: formData.respect === 'mrs' || formData.respect === 'ms' || formData.respect === 'sis' ? 'female' : 'male',
                  mobile: formData.family_phone || '',
                  dob: null,
                  age: null,
                  is_married: 'no',
                  date_of_marriage: null,
                  spouse_id: null,
                  occupation: '',
                  working_place: '',
                  is_baptised: 'no',
                  date_of_baptism: null,
                  is_confirmed: 'no',
                  date_of_confirmation: null,
                  is_alive: 'alive',
                  aadhar_number: ''
                };

                const memberResult = await window.electron.member.create({
                  familyId: currentFamilyId,
                  memberData: familyHeadData,
                  userId: user.id
                });

                if (memberResult.success) {
                  // Navigate to edit the created member
                  navigate(`/area/${areaId}/family/${currentFamilyId}/member/edit/${memberResult.member.id}`, {
                    state: { memberData: memberResult.member }
                  });
                } else {
                  console.error('Failed to create family head member:', memberResult.error);
                  setErrors({ general: 'Family created successfully, but failed to create family head member' });
                }
              } catch (memberError) {
                console.error('Error creating family head member:', memberError);
                setErrors({ general: 'Family created successfully, but failed to create family head member' });
              }
            }
            break;
        }
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

  const handleCancel = () => {
    if (editMode) {
      navigate(`/area/${areaId}/family/${familyId}`);
    } else {
      navigate(`/area/${areaId}`);
    }
  };


  const getPrayerCellDisplayName = (prayerCell) => {
    return `${prayerCell.prayer_cell_identity} - ${prayerCell.prayer_cell_name}`;
  };

  const getSelectedPrayerCellName = () => {
    if (!formData.prayer_cell_id) return '';
    const selectedCell = prayerCells.find(cell => cell.id === formData.prayer_cell_id);
    return selectedCell ? getPrayerCellDisplayName(selectedCell) : '';
  };

  if (loadingArea) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <Spinner />
          <Text style={{ marginLeft: '12px' }}>Loading area information...</Text>
        </div>
      </div>
    );
  }

  if (!currentArea) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div>Area not found</div>
        </div>
      </div>
    );
  }

  const pageTitle = currentPastorate && currentChurch 
    ? `${currentPastorate.pastorate_short_name} - ${currentChurch.church_name} - ${currentArea.area_name}`
    : currentArea.area_name;

  return (
    <div className={styles.container}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        pageTitle={pageTitle}
        breadcrumbs={[
          {
            label: 'Dashboard',
            icon: <HomeRegular />,
            onClick: () => navigate('/dashboard')
          },
          {
            label: currentPastorate?.pastorate_short_name || 'Pastorate',
            onClick: () => navigate('/dashboard')
          },
          {
            label: currentChurch?.church_name || 'Church',
            onClick: () => navigate('/dashboard')
          },
          {
            label: currentArea.area_name,
            onClick: () => navigate(`/area/${areaId}`)
          },
          {
            label: editMode ? 'Edit Family' : 'Create Family',
            current: true
          }
        ]}
        onNavigate={(path) => navigate(path)}
      />

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.formContainer}>
          <div>
            <h1 className={styles.pageTitle}>
              {editMode ? 'Edit Family' : 'Create New Family'}
            </h1>
            <p className={styles.pageSubtitle}>
              {editMode 
                ? 'Update family information below'
                : 'Fill in the details to create a new family record'
              }
            </p>
          </div>

          {/* Error/Success Messages */}
          {errors.general && (
            <MessageBar intent="error">
              <MessageBarBody>{errors.general}</MessageBarBody>
            </MessageBar>
          )}
          
          {errors.success && (
            <MessageBar intent="success">
              <MessageBarBody>{errors.success}</MessageBarBody>
            </MessageBar>
          )}

          {/* Form */}
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Basic Information Row - 3 columns */}
            <div className={styles.formGrid3}>
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
                  value={respectOptions.find(opt => opt.value === formData.respect)?.label || ''}
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

            {/* Contact Information - 3 columns */}
            <div className={styles.formGrid3}>
              <Field
                label="Phone Number"
                required
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
            </div>

            {/* Address - Full width */}
            <div className={styles.formGrid1}>
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
            </div>

            {/* Prayer Cell - Full width */}
            <div className={styles.formGrid1}>
              <Field label="Prayer Cell (Optional)">
                {loadingPrayerCells ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
                    <Spinner size="tiny" />
                    <span style={{ fontSize: '14px', color: '#605e5c' }}>Loading prayer cells...</span>
                  </div>
                ) : (
                  <Combobox
                    value={getSelectedPrayerCellName()}
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

            {/* Notes and Prayer Points - 2 columns */}
            <div className={styles.formGrid2}>
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

          {/* Buttons Row */}
          <div className={styles.buttonRow}>
            <div className={styles.leftButtons}>
              <Button
                className={styles.cancelButton}
                onClick={handleCancel}
                disabled={loading}
                icon={<ArrowLeftRegular />}
              >
                Cancel
              </Button>
            </div>
            <div className={styles.rightButtons}>
              <Button
                className={styles.saveButton}
                disabled={loading}
                onClick={() => handleSave('save')}
              >
                {loading ? <Spinner size="tiny" /> : 'Save'}
              </Button>
              
              <Button
                className={styles.saveAndBackButton}
                disabled={loading}
                onClick={() => handleSave('save-and-back')}
              >
                {loading ? <Spinner size="tiny" /> : editMode ? 'Save & Back to Family' : 'Save & Back to Area'}
              </Button>
              
              {!editMode && (
                <>
                  <Button
                    className={styles.saveContinueButton}
                    disabled={loading}
                    onClick={() => handleSave('save-and-continue')}
                  >
                    {loading ? <Spinner size="tiny" /> : 'Save & Continue'}
                  </Button>
                  
                  <Button
                    className={styles.saveContinueButton}
                    disabled={loading}
                    onClick={() => handleSave('save-and-edit-family-head')}
                  >
                    {loading ? <Spinner size="tiny" /> : 'Save & Edit Family Head'}
                  </Button>
                </>
              )}
            </div>
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
        disablePastorateChurchChange={true}
      />
    </div>
  );
};

export default CreateFamilyPage;