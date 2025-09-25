import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { makeStyles } from '@fluentui/react-components';
import {
  HomeRegular,
  PersonRegular,
  SaveRegular,
  DismissRegular,
  ImageRegular,
  CalendarRegular
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
    padding: '20px 2.5%',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    overflowY: 'auto',
    overflowX: 'hidden',
    minHeight: '0',
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
    padding: '32px',
    width: '95%',
    margin: '0 auto',
  },
  formHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '32px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e1dfdd',
  },
  formTitle: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#323130',
    margin: '0',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    marginBottom: '32px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  formGroupFull: {
    gridColumn: '1 / -1',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#323130',
  },
  required: {
    color: '#d13438',
  },
  input: {
    padding: '12px',
    border: '1px solid #8a8886',
    borderRadius: '4px',
    fontSize: '14px',
    '&:focus': {
      outline: 'none',
      borderColor: '#B5316A',
      boxShadow: '0 0 0 2px rgba(181, 49, 106, 0.2)',
    },
  },
  select: {
    padding: '12px',
    border: '1px solid #8a8886',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white',
    '&:focus': {
      outline: 'none',
      borderColor: '#B5316A',
      boxShadow: '0 0 0 2px rgba(181, 49, 106, 0.2)',
    },
  },
  textarea: {
    padding: '12px',
    border: '1px solid #8a8886',
    borderRadius: '4px',
    fontSize: '14px',
    minHeight: '80px',
    resize: 'vertical',
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
    '&:focus': {
      outline: 'none',
      borderColor: '#B5316A',
      boxShadow: '0 0 0 2px rgba(181, 49, 106, 0.2)',
    },
  },
  imageUpload: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    padding: '24px',
    border: '2px dashed #8a8886',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: '#B5316A',
      backgroundColor: '#f8f8f8',
    },
  },
  imagePreview: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #e1dfdd',
  },
  imageIcon: {
    fontSize: '48px',
    color: '#8a8886',
  },
  imageText: {
    fontSize: '14px',
    color: '#605e5c',
    textAlign: 'center',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  button: {
    padding: '12px 24px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    border: 'none',
  },
  primaryButton: {
    backgroundColor: '#B5316A',
    color: 'white',
    '&:hover': {
      backgroundColor: '#A12B5E',
    },
    '&:disabled': {
      backgroundColor: '#8a8886',
      cursor: 'not-allowed',
    },
  },
  secondaryButton: {
    backgroundColor: 'white',
    color: '#323130',
    border: '1px solid #8a8886',
    '&:hover': {
      backgroundColor: '#f3f2f1',
    },
  },
  error: {
    color: '#d13438',
    fontSize: '12px',
    marginTop: '4px',
  },
  autoField: {
    backgroundColor: '#f8f8f8',
    color: '#605e5c',
    cursor: 'not-allowed',
  },
  conditionalSection: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#f8f8f8',
    borderRadius: '4px',
    border: '1px solid #e1dfdd',
  },
});

// Predefined relation options
const RELATION_OPTIONS = [
  'Family Head',
  'Wife',
  'Husband',
  'Son',
  'Daughter',
  'Father',
  'Mother',
  'Step-Father',
  'Step-Mother',
  'Father-in-law',
  'Mother-in-law',
  'Grandfather',
  'Grandmother',
  'Son-in-law',
  'Daughter-in-law',
  'Grandson',
  'Granddaughter',
  'Adopted Son',
  'Adopted Daughter',
  'Brother',
  'Sister',
  'Step-Brother',
  'Step-Sister',
  'Brother-in-law',
  'Sister-in-law',
  'Uncle',
  'Aunt',
  'Cousin (Male)',
  'Cousin (Female)',
  'Nephew',
  'Niece',
  'Guardian',
  'Partner',
  'Fiancé',
  'Fiancée'
];

const CreateMemberPage = ({
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
  const location = useLocation();
  const { areaId, familyId, memberId } = useParams();

  const isEditMode = !!memberId;
  const initialData = location.state?.memberData;

  // State
  const [currentArea, setCurrentArea] = useState(null);
  const [currentFamily, setCurrentFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loadingFamilyMembers, setLoadingFamilyMembers] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    member_id: '',
    member_number: '',
    respect: 'mr',
    name: '',
    relation: '',
    sex: 'male',
    mobile: '',
    dob: '',
    age: '',
    is_married: 'no',
    date_of_marriage: '',
    spouse_id: '',
    occupation: '',
    working_place: '',
    is_baptised: 'no',
    date_of_baptism: '',
    is_confirmed: 'no',
    date_of_confirmation: '',
    is_alive: 'alive',
    aadhar_number: ''
  });

  // Load initial data
  useEffect(() => {
    if (areaId && familyId && user) {
      loadInitialData();
    }
  }, [areaId, familyId, user?.id]);

  // Populate form data in edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        member_id: initialData.member_id || '',
        member_number: initialData.member_number || '',
        respect: initialData.respect || 'mr',
        name: initialData.name || '',
        relation: initialData.relation || '',
        sex: initialData.sex || 'male',
        mobile: initialData.mobile || '',
        dob: initialData.dob || '',
        age: initialData.age || '',
        is_married: initialData.is_married || 'no',
        date_of_marriage: initialData.date_of_marriage || '',
        spouse_id: initialData.spouse_id || '',
        occupation: initialData.occupation || '',
        working_place: initialData.working_place || '',
        is_baptised: initialData.is_baptised || 'no',
        date_of_baptism: initialData.date_of_baptism || '',
        is_confirmed: initialData.is_confirmed || 'no',
        date_of_confirmation: initialData.date_of_confirmation || '',
        is_alive: initialData.is_alive || 'alive',
        aadhar_number: initialData.aadhar_number || ''
      });

      // Set image preview if exists
      if (initialData.image) {
        // You might need to handle image loading here
        // setImagePreview(imageUrl);
      }
    }
  }, [isEditMode, initialData]);

  // Load family members when the component loads and member is married (edit mode)
  useEffect(() => {
    if (currentFamily && formData.is_married === 'yes' && (isEditMode || familyMembers.length === 0)) {
      loadFamilyMembers();
    }
  }, [currentFamily, formData.is_married, isEditMode]);

  const loadInitialData = async () => {
    setLoading(true);
    setError('');

    try {
      // Load area and family information
      const areasResult = await window.electron.area.getByChurch({
        churchId: currentChurch.id,
        userId: user.id
      });

      if (areasResult.success) {
        const area = areasResult.areas.find(a => a.id === parseInt(areaId));
        if (area) {
          setCurrentArea(area);
          
          // Load families for this area to get the specific family
          const familiesResult = await window.electron.family.getByArea({
            areaId: area.id,
            userId: user.id
          });
          
          if (familiesResult.success) {
            const family = familiesResult.families.find(f => f.id === parseInt(familyId));
            if (family) {
              setCurrentFamily(family);
              
              // If creating new member, get auto-generated numbers
              if (!isEditMode) {
                const autoNumbersResult = await window.electron.member.getAutoNumbers({
                  familyId: family.id,
                  userId: user.id
                });
                
                if (autoNumbersResult.success) {
                  setFormData(prev => ({
                    ...prev,
                    member_id: autoNumbersResult.memberId,
                    member_number: autoNumbersResult.memberNumber
                  }));
                }
              }
            } else {
              setError('Family not found');
            }
          } else {
            setError('Failed to load family information');
          }
        } else {
          setError('Area not found');
        }
      } else {
        setError('Failed to load area information');
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadFamilyMembers = async () => {
    if (!currentFamily || !user) return;

    setLoadingFamilyMembers(true);
    try {
      const result = await window.electron.member.getFamilyMembers({
        familyId: currentFamily.id,
        userId: user.id,
        excludeMemberId: isEditMode ? parseInt(memberId) : null
      });

      if (result.success) {
        setFamilyMembers(result.members || []);
      } else {
        console.error('Failed to load family members:', result.error);
        setFamilyMembers([]);
      }
    } catch (error) {
      console.error('Error loading family members:', error);
      setFamilyMembers([]);
    } finally {
      setLoadingFamilyMembers(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calculate age when DOB changes
    if (field === 'dob' && value) {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFormData(prev => ({
        ...prev,
        age: age >= 0 ? age.toString() : ''
      }));
    }

    // Handle marriage status change
    if (field === 'is_married') {
      if (value === 'no') {
        setFormData(prev => ({
          ...prev,
          date_of_marriage: '',
          spouse_id: ''
        }));
        setFamilyMembers([]);
      } else if (value === 'yes') {
        // Load family members for spouse selection
        loadFamilyMembers();
      }
    }

    // Clear conditional fields when main field changes
    if (field === 'is_baptised' && value === 'no') {
      setFormData(prev => ({
        ...prev,
        date_of_baptism: ''
      }));
    }
    if (field === 'is_confirmed' && value === 'no') {
      setFormData(prev => ({
        ...prev,
        date_of_confirmation: ''
      }));
    }
  };

  const handleImageUpload = async () => {
    try {
      const result = await window.electron.file.openImagePicker();
      if (result.success && !result.canceled) {
        setImageFile(result.data);
        // Create preview URL
        const previewUrl = `data:${result.data.mimeType};base64,${result.data.base64Data}`;
        setImagePreview(previewUrl);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      alert('Failed to select image');
    }
  };

  const validateForm = () => {
    const requiredFields = ['member_number', 'respect', 'name', 'relation', 'sex'];
    const missingFields = requiredFields.filter(field => !formData[field].trim());
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }

    // Validate member number format
    if (!/^\d{2}$/.test(formData.member_number)) {
      setError('Member number must be a 2-digit number');
      return false;
    }

    // Validate relation
    if (!RELATION_OPTIONS.includes(formData.relation)) {
      setError('Please select a valid relation from the dropdown');
      return false;
    }

    // Note: Date of marriage is optional even when married

    // Note: spouse_id is optional - members can be married without selecting a family spouse
    if (formData.is_married === 'yes' && formData.spouse_id) {
      // Additional validation: ensure spouse is not the same person (in edit mode)
      if (isEditMode && parseInt(formData.spouse_id) === parseInt(memberId)) {
        setError('A member cannot be their own spouse');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      let imagePath = null;
      
      // Upload image if selected
      if (imageFile) {
        const uploadResult = await window.electron.file.saveProfileImage({
          userId: user.id,
          imageData: imageFile
        });
        
        if (uploadResult.success) {
          imagePath = uploadResult.filename;
        } else {
          console.error('Failed to upload image:', uploadResult.error);
        }
      }

      const memberData = {
        ...formData,
        image: imagePath || (isEditMode ? initialData?.image : null)
      };

      let result;
      if (isEditMode) {
        result = await window.electron.member.update({
          memberId: parseInt(memberId),
          memberData,
          userId: user.id
        });
      } else {
        result = await window.electron.member.create({
          familyId: parseInt(familyId),
          memberData,
          userId: user.id
        });
      }

      if (result.success) {
        navigate(`/area/${areaId}/family/${familyId}`);
      } else {
        setError(result.error || `Failed to ${isEditMode ? 'update' : 'create'} member`);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} member:`, error);
      setError(`Failed to ${isEditMode ? 'update' : 'create'} member`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/area/${areaId}/family/${familyId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleBackToArea = () => {
    navigate(`/area/${areaId}`);
  };

  const handleBackToFamily = () => {
    navigate(`/area/${areaId}/family/${familyId}`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (error && !currentFamily) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>Error</div>
            <div>{error}</div>
            <button
              onClick={handleBackToFamily}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                backgroundColor: '#B5316A',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Back to Family
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        pageTitle={`${isEditMode ? 'Edit' : 'Create'} Member - ${currentFamily?.family_name || 'Family'}`}
        breadcrumbs={[
          {
            label: 'Dashboard',
            icon: <HomeRegular />,
            onClick: handleBackToDashboard
          },
          {
            label: currentPastorate?.pastorate_short_name || 'Pastorate',
            onClick: handleBackToDashboard
          },
          {
            label: currentChurch?.church_name || 'Church',
            onClick: handleBackToDashboard
          },
          {
            label: currentArea?.area_name || 'Area',
            onClick: handleBackToArea
          },
          {
            label: currentFamily ? `${currentFamily.respect.charAt(0).toUpperCase() + currentFamily.respect.slice(1)}. ${currentFamily.family_name}` : 'Family',
            onClick: handleBackToFamily
          },
          {
            label: `${isEditMode ? 'Edit' : 'Create'} Member`,
            current: true
          }
        ]}
        onNavigate={(path) => navigate(path)}
      />

      {/* Content */}
      <div className={styles.content}>
        <form onSubmit={handleSubmit} className={styles.formSection}>
          <div className={styles.formHeader}>
            <PersonRegular style={{ fontSize: '32px', color: '#B5316A' }} />
            <h1 className={styles.formTitle}>
              {isEditMode ? 'Edit Member' : 'Create New Member'}
            </h1>
          </div>

          {error && (
            <div className={styles.error} style={{ marginBottom: '24px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <div className={styles.formGrid}>
            {/* Member ID (Auto-generated) */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Member ID <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={formData.member_id}
                className={`${styles.input} ${styles.autoField}`}
                readOnly
                title="Auto-generated member ID"
              />
            </div>

            {/* Member Number */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Member Number <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={formData.member_number}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                  if (value.length <= 2) {
                    handleInputChange('member_number', value);
                  }
                }}
                className={styles.input}
                placeholder="01"
                maxLength="2"
                pattern="\d{2}"
                title="2-digit member number (numbers only)"
              />
            </div>

            {/* Respect */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Respect <span className={styles.required}>*</span>
              </label>
              <select
                value={formData.respect}
                onChange={(e) => handleInputChange('respect', e.target.value)}
                className={styles.select}
              >
                <option value="mr">Mr</option>
                <option value="mrs">Mrs</option>
                <option value="ms">Ms</option>
                <option value="master">Master</option>
                <option value="rev">Rev</option>
                <option value="dr">Dr</option>
                <option value="er">Er</option>
                <option value="sis">Sis</option>
                <option value="bishop">Bishop</option>
              </select>
            </div>

            {/* Name */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={styles.input}
                placeholder="Enter full name"
              />
            </div>

            {/* Relation */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Relation <span className={styles.required}>*</span>
              </label>
              <select
                value={formData.relation}
                onChange={(e) => handleInputChange('relation', e.target.value)}
                className={styles.select}
              >
                <option value="">Select relation</option>
                {RELATION_OPTIONS.map(relation => (
                  <option key={relation} value={relation}>{relation}</option>
                ))}
              </select>
            </div>

            {/* Sex */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Sex <span className={styles.required}>*</span>
              </label>
              <select
                value={formData.sex}
                onChange={(e) => handleInputChange('sex', e.target.value)}
                className={styles.select}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Mobile */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Mobile Number</label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                className={styles.input}
                placeholder="Enter mobile number"
              />
            </div>

            {/* Date of Birth */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Date of Birth</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => handleInputChange('dob', e.target.value)}
                className={styles.input}
              />
            </div>

            {/* Age (Auto-calculated) */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Age</label>
              <input
                type="text"
                value={formData.age}
                className={`${styles.input} ${styles.autoField}`}
                readOnly
                placeholder="Auto-calculated from DOB"
              />
            </div>

            {/* Occupation */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Occupation</label>
              <input
                type="text"
                value={formData.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                className={styles.input}
                placeholder="Enter occupation"
              />
            </div>

            {/* Working Place */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Working Place</label>
              <input
                type="text"
                value={formData.working_place}
                onChange={(e) => handleInputChange('working_place', e.target.value)}
                className={styles.input}
                placeholder="Enter working place"
              />
            </div>

            {/* Aadhar Number */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Aadhar Number</label>
              <input
                type="text"
                value={formData.aadhar_number}
                onChange={(e) => handleInputChange('aadhar_number', e.target.value)}
                className={styles.input}
                placeholder="Enter Aadhar number"
                maxLength="12"
              />
            </div>

            {/* Is Alive */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Status</label>
              <select
                value={formData.is_alive}
                onChange={(e) => handleInputChange('is_alive', e.target.value)}
                className={styles.select}
              >
                <option value="alive">Alive</option>
                <option value="death">Death</option>
              </select>
            </div>

            {/* Marriage Status */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Is Married</label>
              <select
                value={formData.is_married}
                onChange={(e) => handleInputChange('is_married', e.target.value)}
                className={styles.select}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
              
              {formData.is_married === 'yes' && (
                <div className={styles.conditionalSection}>
                  <label className={styles.label}>Date of Marriage</label>
                  <input
                    type="date"
                    value={formData.date_of_marriage}
                    onChange={(e) => handleInputChange('date_of_marriage', e.target.value)}
                    className={styles.input}
                  />
                  
                  <label className={styles.label} style={{ marginTop: '16px' }}>
                    Spouse {loadingFamilyMembers && <span style={{ color: '#605e5c', fontSize: '12px' }}>(Loading...)</span>}
                  </label>
                  <select
                    value={formData.spouse_id}
                    onChange={(e) => handleInputChange('spouse_id', e.target.value)}
                    className={styles.select}
                    disabled={loadingFamilyMembers}
                  >
                    <option value="">Select spouse from family members</option>
                    {familyMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.respect.charAt(0).toUpperCase() + member.respect.slice(1)}. {member.name}
                        {member.relation && ` (${member.relation})`}
                      </option>
                    ))}
                  </select>
                  {familyMembers.length === 0 && !loadingFamilyMembers && (
                    <div style={{ fontSize: '12px', color: '#605e5c', marginTop: '4px' }}>
                      No other family members available for spouse selection
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Baptism Status */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Is Baptised</label>
              <select
                value={formData.is_baptised}
                onChange={(e) => handleInputChange('is_baptised', e.target.value)}
                className={styles.select}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
              
              {formData.is_baptised === 'yes' && (
                <div className={styles.conditionalSection}>
                  <label className={styles.label}>Date of Baptism</label>
                  <input
                    type="date"
                    value={formData.date_of_baptism}
                    onChange={(e) => handleInputChange('date_of_baptism', e.target.value)}
                    className={styles.input}
                  />
                </div>
              )}
            </div>

            {/* Confirmation Status */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Is Confirmed</label>
              <select
                value={formData.is_confirmed}
                onChange={(e) => handleInputChange('is_confirmed', e.target.value)}
                className={styles.select}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
              
              {formData.is_confirmed === 'yes' && (
                <div className={styles.conditionalSection}>
                  <label className={styles.label}>Date of Confirmation</label>
                  <input
                    type="date"
                    value={formData.date_of_confirmation}
                    onChange={(e) => handleInputChange('date_of_confirmation', e.target.value)}
                    className={styles.input}
                  />
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>Member Image</label>
              <div className={styles.imageUpload} onClick={handleImageUpload}>
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Member preview" 
                    className={styles.imagePreview}
                  />
                ) : (
                  <>
                    <ImageRegular className={styles.imageIcon} />
                    <div className={styles.imageText}>
                      Click to upload member image<br />
                      <small>JPG, PNG, GIF up to 10MB</small>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={handleCancel}
              className={`${styles.button} ${styles.secondaryButton}`}
              disabled={saving}
            >
              <DismissRegular />
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.button} ${styles.primaryButton}`}
              disabled={saving}
            >
              <SaveRegular />
              {saving ? 'Saving...' : (isEditMode ? 'Update Member' : 'Create Member')}
            </button>
          </div>
        </form>
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

export default CreateMemberPage;