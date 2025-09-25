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

const ChurchSettingsPage = ({ 
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
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    church_name_tamil: '',
    church_name_english: '',
    village_name_tamil: '',
    village_name_english: '',
    catechist_name_tamil: '',
    catechist_name_english: '',
    church_address_tamil: '',
    church_address_english: '',
    phone_number: '',
    email_address: ''
  });

  useEffect(() => {
    if (currentChurch && user) {
      loadSettings();
    }
  }, [currentChurch?.id, user?.id]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const result = await window.electron.church.getSettings({
        churchId: currentChurch.id,
        userId: user.id
      });

      if (result.success) {
        setFormData({
          church_name_tamil: result.settings.church_name_tamil || '',
          church_name_english: result.settings.church_name_english || currentChurch.church_name,
          village_name_tamil: result.settings.village_name_tamil || '',
          village_name_english: result.settings.village_name_english || '',
          catechist_name_tamil: result.settings.catechist_name_tamil || '',
          catechist_name_english: result.settings.catechist_name_english || '',
          church_address_tamil: result.settings.church_address_tamil || '',
          church_address_english: result.settings.church_address_english || '',
          phone_number: result.settings.phone_number || '',
          email_address: result.settings.email_address || ''
        });
      } else {
        // Load default settings
        const defaultResult = await window.electron.church.getDefaultSettings({
          churchId: currentChurch.id,
          userId: user.id
        });

        if (defaultResult.success) {
          setFormData({
            ...defaultResult.settings,
            church_name_tamil: '',
            church_name_english: currentChurch.church_name,
          });
        }
      }
    } catch (error) {
      console.error('Error loading church settings:', error);
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
    // Basic validation for required fields
    if (!formData.village_name_english.trim() && !formData.village_name_tamil.trim()) {
      setErrorMessage('Please enter village name in at least one language');
      setShowErrorDialog(true);
      return;
    }

    setSaving(true);
    try {
      const result = await window.electron.church.saveSettings({
        churchId: currentChurch.id,
        settingsData: formData,
        userId: user.id
      });

      if (result.success) {
        navigate('/dashboard?view=church');
      } else {
        setErrorMessage(result.error || 'Failed to save settings');
        setShowErrorDialog(true);
      }
    } catch (error) {
      console.error('Error saving church settings:', error);
      setErrorMessage('An error occurred while saving settings');
      setShowErrorDialog(true);
    } finally {
      setSaving(false);
    }
  };

  const closeErrorDialog = () => {
    setShowErrorDialog(false);
    setErrorMessage('');
  };

  const handleBack = () => {
    navigate('/dashboard?view=church');
  };

  if (!currentChurch) {
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

  const separatorStyle = {
    backgroundColor: '#B5316A',
    width: '2px',
    height: '40px',
    margin: '0 auto',
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

  const errorDialogOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  };

  const errorDialogStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  };

  const errorDialogTitleStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#d13438',
    marginBottom: '12px',
  };

  const errorDialogMessageStyle = {
    fontSize: '14px',
    color: '#323130',
    marginBottom: '20px',
    lineHeight: '1.4',
  };

  const errorDialogButtonStyle = {
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    float: 'right',
  };

  return (
    <div style={containerStyle}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        pageTitle="Church Settings"
        breadcrumbs={[
          {
            label: 'Church Dashboard',
            icon: <HomeRegular />,
            onClick: handleBack
          },
          {
            label: 'Church Settings',
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

              {/* Village Name */}
              <div style={fieldRowStyle}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Village Name</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.village_name_english}
                    onChange={(e) => handleInputChange('village_name_english', e.target.value)}
                    placeholder="Enter village name in English"
                  />
                </div>
                <div style={separatorStyle}></div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>ஊரின் பெயர்</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.village_name_tamil}
                    onChange={(e) => handleInputChange('village_name_tamil', e.target.value)}
                    placeholder="தமிழில் ஊரின் பெயரை உள்ளிடவும்"
                  />
                </div>
              </div>

              {/* Catechist Name */}
              <div style={fieldRowStyle}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Catechist Name</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.catechist_name_english}
                    onChange={(e) => handleInputChange('catechist_name_english', e.target.value)}
                    placeholder="Enter catechist name in English"
                  />
                </div>
                <div style={separatorStyle}></div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>உபதேசியாரின் பெயர்</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.catechist_name_tamil}
                    onChange={(e) => handleInputChange('catechist_name_tamil', e.target.value)}
                    placeholder="தமிழில் உபதேசியாரின் பெயரை உள்ளிடவும்"
                  />
                </div>
              </div>

              {/* Church Address */}
              <div style={fieldRowStyle}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Church Address</label>
                  <textarea
                    style={textAreaStyle}
                    value={formData.church_address_english}
                    onChange={(e) => handleInputChange('church_address_english', e.target.value)}
                    placeholder="Enter church address in English"
                    rows={3}
                  />
                </div>
                <div style={separatorStyle}></div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>ஆலயத்தின் முகவரி</label>
                  <textarea
                    style={textAreaStyle}
                    value={formData.church_address_tamil}
                    onChange={(e) => handleInputChange('church_address_tamil', e.target.value)}
                    placeholder="தமிழில் ஆலயத்தின் முகவரியை உள்ளிடவும்"
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
                  Back to Church Dashboard
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
        currentView="church"
      />

      {/* Error Dialog */}
      {showErrorDialog && (
        <div style={errorDialogOverlayStyle} onClick={closeErrorDialog}>
          <div style={errorDialogStyle} onClick={(e) => e.stopPropagation()}>
            <div style={errorDialogTitleStyle}>Error</div>
            <div style={errorDialogMessageStyle}>{errorMessage}</div>
            <button style={errorDialogButtonStyle} onClick={closeErrorDialog}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChurchSettingsPage;