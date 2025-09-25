import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HomeRegular,
  SaveRegular,
  ArrowClockwiseRegular,
  ArrowLeftRegular
} from '@fluentui/react-icons';
import StatusBar from './StatusBar';
import Breadcrumb from './Breadcrumb';

const PastorateSettingsPage = ({ 
  currentPastorate, 
  user,
  onLogout,
  onProfileClick,
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    pastorate_name_tamil: '',
    pastorate_name_english: '',
    diocese_name_tamil: 'திருநெல்வேலி திருமண்டலம்',
    diocese_name_english: 'Tirunelveli Diocese',
    church_name_tamil: 'தென்னிந்திய திருச்சபை',
    church_name_english: 'Church of South India',
    chairman_name_tamil: '',
    chairman_name_english: '',
    presbyter_name_tamil: '',
    presbyter_name_english: '',
    office_address_tamil: '',
    office_address_english: '',
    phone_number: '',
    email_address: ''
  });

  useEffect(() => {
    if (currentPastorate && user) {
      loadSettings();
    }
  }, [currentPastorate?.id, user?.id]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const result = await window.electron.pastorate.getSettings({
        pastorateId: currentPastorate.id,
        userId: user.id
      });

      if (result.success) {
        setFormData({
          pastorate_name_tamil: result.settings.pastorate_name_tamil || '',
          pastorate_name_english: result.settings.pastorate_name_english || currentPastorate.pastorate_name,
          diocese_name_tamil: result.settings.diocese_name_tamil || 'திருநெல்வேலி திருமண்டலம்',
          diocese_name_english: result.settings.diocese_name_english || 'Tirunelveli Diocese',
          church_name_tamil: result.settings.church_name_tamil || 'தென்னிந்திய திருச்சபை',
          church_name_english: result.settings.church_name_english || 'Church of South India',
          chairman_name_tamil: result.settings.chairman_name_tamil || '',
          chairman_name_english: result.settings.chairman_name_english || '',
          presbyter_name_tamil: result.settings.presbyter_name_tamil || '',
          presbyter_name_english: result.settings.presbyter_name_english || '',
          office_address_tamil: result.settings.office_address_tamil || '',
          office_address_english: result.settings.office_address_english || '',
          phone_number: result.settings.phone_number || '',
          email_address: result.settings.email_address || ''
        });
      } else {
        // Load default settings
        const defaultResult = await window.electron.pastorate.getDefaultSettings({
          pastorateId: currentPastorate.id,
          userId: user.id
        });

        if (defaultResult.success) {
          setFormData({
            ...defaultResult.settings,
            pastorate_name_tamil: '',
            pastorate_name_english: currentPastorate.pastorate_name,
          });
        }
      }
    } catch (error) {
      console.error('Error loading pastorate settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await window.electron.pastorate.saveSettings({
        pastorateId: currentPastorate.id,
        settingsData: formData,
        userId: user.id
      });

      if (result.success) {
        navigate('/dashboard?view=pastorate');
      } else {
        console.error('Save pastorate settings error:', result.error);
      }
    } catch (error) {
      console.error('Error saving pastorate settings:', error);
      console.error('Error saving pastorate settings');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard?view=pastorate');
  };

  if (!currentPastorate) {
    return null;
  }

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 32px)',
    backgroundColor: '#f8f8f8',
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
    overflow: 'hidden',
  };

  const contentStyle = {
    flex: 1,
    padding: '20px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    overflowY: 'auto',
    overflowX: 'hidden',
    minHeight: '0',
  };

  const pageHeaderStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
    padding: '30px',
    marginBottom: '24px',
  };

  const formContainerStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: '600',
    color: '#323130',
    margin: '0 0 8px 0',
  };

  const subtitleStyle = {
    fontSize: '16px',
    color: '#605e5c',
    margin: '0',
  };

  const languageHeaderStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 2px 1fr',
    gap: '30px',
    alignItems: 'center',
    marginBottom: '20px',
  };

  const languageTitleStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#B5316A',
    textAlign: 'center',
    padding: '10px 0',
    backgroundColor: '#f8f8f8',
    borderRadius: '6px',
  };

  const separatorStyle = {
    backgroundColor: '#B5316A',
    width: '2px',
    height: '40px',
    margin: '0 auto',
  };

  const fieldRowStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 2px 1fr',
    gap: '30px',
    alignItems: 'start',
  };

  const fieldGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#323130',
    marginBottom: '4px',
  };

  const inputStyle = {
    padding: '12px',
    border: '1px solid #d1d1d1',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
  };

  const textAreaStyle = {
    padding: '12px',
    border: '1px solid #d1d1d1',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '80px',
  };

  const singleFieldRowStyle = {
    display: 'flex',
    gap: '30px',
    alignItems: 'start',
  };

  const singleFieldStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const actionsStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '20px 0',
    borderTop: '1px solid #e1dfdd',
    marginTop: '20px',
  };

  const buttonStyle = {
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: 'none',
    transition: 'all 0.2s ease',
  };

  const backButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#e1dfdd',
    color: '#323130',
  };

  const saveButtonStyle = {
    ...buttonStyle,
    backgroundColor: saving ? '#d1d1d1' : '#B5316A',
    color: 'white',
  };

  const loadingStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    color: '#605e5c',
    gap: '12px',
  };

  return (
    <div style={containerStyle}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        pageTitle="Pastorate Settings"
        breadcrumbs={[
          {
            label: 'Dashboard',
            icon: <HomeRegular />,
            onClick: handleBack
          },
          {
            label: 'Pastorate Settings',
            current: true
          }
        ]}
        onNavigate={() => {}}
      />

      {/* Content */}
      <div style={contentStyle}>
        {/* Settings Form */}
        <div style={formContainerStyle}>
          {loading ? (
            <div style={loadingStyle}>
              <ArrowClockwiseRegular fontSize={20} />
              Loading settings...
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
              {/* Pastorate Name */}
              <div style={fieldRowStyle}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Pastorate Name</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.pastorate_name_english}
                    onChange={(e) => handleInputChange('pastorate_name_english', e.target.value)}
                    placeholder="Enter pastorate name in English"
                  />
                </div>
                <div style={separatorStyle}></div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>சேகரத்தின் பெயர்</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.pastorate_name_tamil}
                    onChange={(e) => handleInputChange('pastorate_name_tamil', e.target.value)}
                    placeholder="தமிழில் சேகரத்தின் பெயரை உள்ளிடவும்"
                  />
                </div>
              </div>

              {/* Diocese Name */}
              <div style={fieldRowStyle}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Diocese Name</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.diocese_name_english}
                    onChange={(e) => handleInputChange('diocese_name_english', e.target.value)}
                    placeholder="Enter diocese name in English"
                  />
                </div>
                <div style={separatorStyle}></div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>திருமண்டலத்தின் பெயர்</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.diocese_name_tamil}
                    onChange={(e) => handleInputChange('diocese_name_tamil', e.target.value)}
                    placeholder="தமிழில் திருமண்டலத்தின் பெயரை உள்ளிடவும்"
                  />
                </div>
              </div>

              {/* Church Name */}
              <div style={fieldRowStyle}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Church Name</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.church_name_english}
                    onChange={(e) => handleInputChange('church_name_english', e.target.value)}
                    placeholder="Enter church name in English"
                  />
                </div>
                <div style={separatorStyle}></div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>திருச்சபையின் பெயர்</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.church_name_tamil}
                    onChange={(e) => handleInputChange('church_name_tamil', e.target.value)}
                    placeholder="தமிழில் திருச்சபையின் பெயரை உள்ளிடவும்"
                  />
                </div>
              </div>

              {/* Chairman Name */}
              <div style={fieldRowStyle}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Pastorate Chairman Name</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.chairman_name_english}
                    onChange={(e) => handleInputChange('chairman_name_english', e.target.value)}
                    placeholder="Enter chairman name in English"
                  />
                </div>
                <div style={separatorStyle}></div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>சேகர தலைவரின் பெயர்</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.chairman_name_tamil}
                    onChange={(e) => handleInputChange('chairman_name_tamil', e.target.value)}
                    placeholder="தமிழில் சேகர தலைவரின் பெயரை உள்ளிடவும்"
                  />
                </div>
              </div>

              {/* Presbyter Name */}
              <div style={fieldRowStyle}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Pastorate Presbyter Name</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.presbyter_name_english}
                    onChange={(e) => handleInputChange('presbyter_name_english', e.target.value)}
                    placeholder="Enter presbyter name in English"
                  />
                </div>
                <div style={separatorStyle}></div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>சேகர குருவானவரின் பெயர்</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.presbyter_name_tamil}
                    onChange={(e) => handleInputChange('presbyter_name_tamil', e.target.value)}
                    placeholder="தமிழில் சேகர குருவானவரின் பெயரை உள்ளிடவும்"
                  />
                </div>
              </div>

              {/* Office Address */}
              <div style={fieldRowStyle}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Pastorate Office Address</label>
                  <textarea
                    style={textAreaStyle}
                    value={formData.office_address_english}
                    onChange={(e) => handleInputChange('office_address_english', e.target.value)}
                    placeholder="Enter office address in English"
                    rows={3}
                  />
                </div>
                <div style={separatorStyle}></div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>சேகர அலுவலக முகவரி</label>
                  <textarea
                    style={textAreaStyle}
                    value={formData.office_address_tamil}
                    onChange={(e) => handleInputChange('office_address_tamil', e.target.value)}
                    placeholder="தமிழில் சேகர அலுவலக முகவரியை உள்ளிடவும்"
                    rows={3}
                  />
                </div>
              </div>

              {/* Phone Number and Email */}
              <div style={singleFieldRowStyle}>
                <div style={singleFieldStyle}>
                  <label style={labelStyle}>Phone Number</label>
                  <input
                    type="tel"
                    style={inputStyle}
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div style={singleFieldStyle}>
                  <label style={labelStyle}>Email Address</label>
                  <input
                    type="email"
                    style={inputStyle}
                    value={formData.email_address}
                    onChange={(e) => handleInputChange('email_address', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={actionsStyle}>
                <button
                  style={backButtonStyle}
                  onClick={handleBack}
                  disabled={saving}
                >
                  <ArrowLeftRegular fontSize={16} />
                  Back to Dashboard
                </button>
                <button
                  style={saveButtonStyle}
                  onClick={handleSave}
                  disabled={saving || loading}
                >
                  {saving ? (
                    <>
                      <ArrowClockwiseRegular fontSize={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <SaveRegular fontSize={16} />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
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
        currentView="pastorate"
      />
    </div>
  );
};

export default PastorateSettingsPage;