import React, { useState, useEffect, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HomeRegular,
  PeopleListRegular,
  FilterRegular,
  ArrowClockwiseRegular,
  DocumentPdfRegular,
  PrintRegular,
  PeopleRegular
} from '@fluentui/react-icons';
import StatusBar from './StatusBar';
import Breadcrumb from './Breadcrumb';
import { generatePuppeteerSabaiJabithaReport } from '../utils/sabaiJabithaReportPuppeteer';

const SabaiJabithaPage = ({
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
  console.log('SabaiJabithaPage: Starting with props:', {
    user: user?.id,
    currentPastorate: currentPastorate?.pastorate_name,
    currentChurch: currentChurch?.church_name
  });

  const navigate = useNavigate();

  // State management
  const [congregationData, setCongregationData] = useState([]);
  const [areas, setAreas] = useState([]);
  const [statistics, setStatistics] = useState({
    totalFamilies: 0,
    totalMembers: 0,
    baptisedMembers: 0,
    confirmedMembers: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedArea, setSelectedArea] = useState('');
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    console.log('SabaiJabithaPage: useEffect triggered', { 
      currentChurch: currentChurch?.id, 
      user: user?.id 
    });
    
    if (currentChurch && user) {
      loadData();
    }
  }, [currentChurch?.id, user?.id]);

  const loadData = async () => {
    console.log('SabaiJabithaPage: Starting to load data...');
    setLoading(true);
    setError(null);

    try {
      // Test Electron API availability
      if (!window.electron) {
        throw new Error('Electron API not available');
      }
      
      if (!window.electron.sabaiJabitha) {
        throw new Error('Sabai Jabitha service not available');
      }

      console.log('SabaiJabithaPage: Electron API is available, calling getCongregationData...');

      // Get congregation data
      const result = await window.electron.sabaiJabitha.getCongregationData({
        churchId: currentChurch.id,
        userId: user.id,
        areaId: selectedArea || null
      });

      console.log('SabaiJabithaPage: getCongregationData result:', result);

      if (result.success) {
        const { families, statistics } = result.data;
        setCongregationData(families || []);
        
        setStatistics({
          totalFamilies: statistics?.total_families || 0,
          totalMembers: statistics?.total_members || 0,
          baptisedMembers: statistics?.baptised_members || 0,
          confirmedMembers: statistics?.confirmed_members || 0
        });

        console.log('SabaiJabithaPage: Data loaded successfully', {
          familiesCount: families?.length || 0,
          statistics
        });
      } else {
        console.error('SabaiJabithaPage: Failed to load data:', result.error);
        setError(`Failed to load congregation data: ${result.error}`);
      }

      // Load areas
      if (window.electron.area) {
        const areasResult = await window.electron.area.getByChurch({
          churchId: currentChurch.id,
          userId: user.id
        });
        
        if (areasResult.success) {
          setAreas(areasResult.areas || []);
          console.log('SabaiJabithaPage: Areas loaded:', areasResult.areas?.length || 0);
        }
      }

    } catch (error) {
      console.error('SabaiJabithaPage: Error loading data:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    console.log('SabaiJabithaPage: Refresh clicked');
    loadData();
  };

  // Helper functions for table rendering
  const capitalizeRespect = (respect) => {
    if (!respect) return '';
    return respect.charAt(0).toUpperCase() + respect.slice(1).toLowerCase();
  };

  const getAgeCategoryMark = (age, category) => {
    if (!age) return '';
    
    switch (category) {
      case '1-15':
        return (age >= 1 && age <= 15) ? 'X' : '';
      case '16-35':
        return (age >= 16 && age <= 35) ? 'X' : '';
      case '35+':
        return (age > 35) ? 'X' : '';
      default:
        return '';
    }
  };

  const getCategoryMark = (member) => {
    // பி for children <=15, regardless of gender
    if (member.age <= 15) {
      return 'பி';
    }
    // ஆ for males >15, பெ for females >15
    return member.sex === 'male' ? 'ஆ' : 'பெ';
  };

  const renderCongregationRows = () => {
    const rows = [];
    
    congregationData.forEach((familyGroup, familyIndex) => {
      // Only add member rows (removed family header rows)
      familyGroup.members.forEach((member, memberIndex) => {
        rows.push(
          <tr key={`member-${member.id}`} style={{
            backgroundColor: 'white'
          }}>
            <td style={tableCellStyle}>
              {familyGroup.family.combined_family_number ||
               `${familyGroup.area?.area_identity}${familyGroup.family.family_number}`}
            </td>
            <td style={{ ...tableCellStyle, textAlign: 'left' }}>
              <div>{capitalizeRespect(member.respect)}. {member.name}</div>
              {member.aadhar_number && (
                <div style={{ fontSize: '11px', color: '#605e5c' }}>
                  ({member.aadhar_number})
                </div>
              )}
            </td>
            <td style={tableCellStyle}>{member.age || 'N/A'}</td>
            <td style={{ ...tableCellStyle, fontWeight: '700', color: '#B5316A' }}>
              {getAgeCategoryMark(member.age, '1-15')}
            </td>
            <td style={{ ...tableCellStyle, fontWeight: '700', color: '#B5316A' }}>
              {getAgeCategoryMark(member.age, '16-35')}
            </td>
            <td style={{ ...tableCellStyle, fontWeight: '700', color: '#B5316A' }}>
              {getAgeCategoryMark(member.age, '35+')}
            </td>
            <td style={{ ...tableCellStyle, fontWeight: '700', color: '#B5316A' }}>
              {getCategoryMark(member)}
            </td>
            <td style={tableCellStyle}>
              {member.serial_number || member.member_number}
            </td>
            <td style={{ ...tableCellStyle, fontWeight: '700', color: '#B5316A' }}>
              {member.is_baptised === 'yes' ? 'X' : ''}
            </td>
            <td style={{ ...tableCellStyle, fontWeight: '700', color: '#B5316A' }}>
              {member.is_confirmed === 'yes' ? 'X' : ''}
            </td>
            <td style={tableCellStyle}>{member.notes || '-'}</td>
          </tr>
        );
      });
    });

    return rows;
  };

  const handleGenerateReport = async (action = 'view') => {
    if (congregationData.length === 0) {
      alert('தரவு இல்லை / No data available for report generation');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Starting Sabai Jabitha report generation...');
      
      // Get enhanced church data
      const enhancedChurch = await getEnhancedChurchData();
      console.log('✅ Enhanced church data retrieved');
      
      // Generate PDF report using Puppeteer utility module
      console.log('🔄 Calling generatePuppeteerSabaiJabithaReport...');
      const reportResult = await generatePuppeteerSabaiJabithaReport(
        congregationData,
        enhancedChurch,
        {
          year: reportYear,
          areaId: selectedArea
        },
        action
      );
      
      console.log('📋 Report result received:', reportResult);
      
      if (reportResult && reportResult.success) {
        console.log('✅ Sabai Jabitha report generated successfully');
        if (action === 'view') {
          console.log('✅ PDF should have opened in new window');
        } else if (action === 'print') {
          console.log('✅ Print dialog should have opened');
        }
      } else {
        console.error('❌ Report generation failed:', reportResult?.error || 'Unknown error');
        alert(`Error generating report: ${reportResult?.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      console.error('❌ Report generation error:', error);
      console.error('❌ Error stack:', error.stack);
      alert(`Error generating report: ${error.message}`);
    } finally {
      console.log('🔄 Clearing loading state...');
      setLoading(false);
      console.log('✅ Loading state cleared');
    }
  };

  const handleViewReport = () => handleGenerateReport('view');
  const handleDownloadReport = () => handleGenerateReport('download');
  const handlePrintReport = () => handleGenerateReport('print');

  // Get enhanced church data with proper settings
  const getEnhancedChurchData = async () => {
    try {
      let pastorateSettings = null;
      let churchSettings = null;

      try {
        const settingsResult = await window.electron.pastorate.getSettings({
          pastorateId: currentPastorate.id,
          userId: user.id
        });
        if (settingsResult.success) {
          pastorateSettings = settingsResult.settings;
        }
      } catch (error) {
        console.warn('Could not fetch pastorate settings:', error);
      }

      try {
        const churchSettingsResult = await window.electron.church.getSettings({
          churchId: currentChurch.id,
          userId: user.id
        });
        if (churchSettingsResult.success) {
          churchSettings = churchSettingsResult.settings;
        }
      } catch (error) {
        console.warn('Could not fetch church settings:', error);
      }

      return {
        ...currentChurch,
        diocese_name: pastorateSettings?.diocese_name_english || 'Tirunelveli Diocese',
        pastorate_short_name: currentPastorate?.pastorate_short_name || 'Pastorate',
        church_display_name: churchSettings?.church_name_english || currentChurch.church_name,
        church_short_name: currentChurch.church_short_name || currentChurch.church_name?.substring(0, 4)?.toUpperCase()
      };
    } catch (error) {
      console.error('Error getting enhanced church data:', error);
      return {
        ...currentChurch,
        diocese_name: 'Tirunelveli Diocese',
        pastorate_short_name: currentPastorate?.pastorate_short_name || 'Pastorate',
        church_display_name: currentChurch.church_name,
        church_short_name: currentChurch.church_short_name || currentChurch.church_name?.substring(0, 4)?.toUpperCase()
      };
    }
  };

  // Basic styles
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 32px)',
    backgroundColor: '#f8f8f8',
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif'
  };

  const contentStyle = {
    flex: 1,
    padding: '32px 40px',
    overflowY: 'auto'
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
    marginBottom: '20px'
  };

  const buttonStyle = {
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginRight: '10px'
  };

  const tableHeaderStyle = {
    padding: '12px 8px',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '12px',
    color: '#323130',
    borderBottom: '2px solid #e1dfdd',
    borderRight: '1px solid #e1dfdd',
    backgroundColor: '#fafafa',
    fontFamily: 'Pavanam, Segoe UI, sans-serif',
    lineHeight: '1.3',
    minWidth: '60px'
  };

  const tableCellStyle = {
    padding: '8px 8px',
    fontSize: '12px',
    color: '#323130',
    borderBottom: '1px solid #e1dfdd',
    borderRight: '1px solid #e1dfdd',
    textAlign: 'center',
    fontFamily: 'Pavanam, Segoe UI, sans-serif',
    lineHeight: '1.3'
  };

  // Error state
  if (error) {
    return (
      <div style={containerStyle}>
        <div style={contentStyle}>
          <div style={{ ...cardStyle, textAlign: 'center', color: '#d13438' }}>
            <h2>Error Loading Sabai Jabitha Data</h2>
            <p>{error}</p>
            <button style={buttonStyle} onClick={handleRefresh}>
              <ArrowClockwiseRegular style={{ marginRight: '4px' }} />
              Retry
            </button>
            <button 
              style={{ ...buttonStyle, backgroundColor: '#6c757d' }}
              onClick={() => navigate('/church-dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading/Missing data state
  if (!currentChurch || !currentPastorate) {
    return (
      <div style={containerStyle}>
        <div style={contentStyle}>
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <h2>Loading...</h2>
            <p>
              {!currentPastorate && !currentChurch && 'Loading pastorate and church data...'}
              {!currentPastorate && currentChurch && 'No pastorate selected. Please select a pastorate first.'}
              {currentPastorate && !currentChurch && 'No church selected. Please select a church first.'}
            </p>
            <button 
              style={buttonStyle}
              onClick={() => navigate('/pastorate-dashboard')}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div style={containerStyle}>
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          pageTitle={`சபை ஜாபிதா - ${currentChurch.church_name}`}
          breadcrumbs={[
            {
              label: `${currentPastorate.pastorate_short_name} Dashboard`,
              icon: <HomeRegular />,
              onClick: () => navigate('/pastorate-dashboard')
            },
            {
              label: `${currentChurch.church_name}`,
              onClick: () => navigate('/church-dashboard')
            },
            {
              label: 'சபை ஜாபிதா',
              current: true
            }
          ]}
          onNavigate={(path) => navigate(path)}
        />

      {/* Content */}
      <div style={contentStyle}>
        {/* Statistics */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', fontFamily: 'Pavanam, Segoe UI, sans-serif' }}>
            <PeopleListRegular style={{ marginRight: '8px' }} />
            சபை ஜாபிதா Statistics
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#B5316A' }}>
                {statistics.totalFamilies}
              </div>
              <div style={{ fontSize: '14px', color: '#605e5c', fontFamily: 'Pavanam, Segoe UI, sans-serif' }}>மொத்த குடும்பங்கள்</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#B5316A' }}>
                {statistics.totalMembers}
              </div>
              <div style={{ fontSize: '14px', color: '#605e5c', fontFamily: 'Pavanam, Segoe UI, sans-serif' }}>மொத்த உறுப்பினர்கள்</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#B5316A' }}>
                {statistics.baptisedMembers}
              </div>
              <div style={{ fontSize: '14px', color: '#605e5c', fontFamily: 'Pavanam, Segoe UI, sans-serif' }}>ஞானஸ்நானகாரர்கள்</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#B5316A' }}>
                {statistics.confirmedMembers}
              </div>
              <div style={{ fontSize: '14px', color: '#605e5c', fontFamily: 'Pavanam, Segoe UI, sans-serif' }}>நற்கருணைதாரர்கள்</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', fontFamily: 'Pavanam, Segoe UI, sans-serif' }}>
            <FilterRegular style={{ marginRight: '8px' }} />
            Reports
          </h3>

          <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontWeight: '600', whiteSpace: 'nowrap', fontFamily: 'Pavanam, Segoe UI, sans-serif' }}>
                Area / பகுதி:
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #8a8886',
                  borderRadius: '4px',
                  fontSize: '14px',
                  minWidth: '200px',
                  fontFamily: 'Pavanam, Segoe UI, sans-serif'
                }}
              >
                <option value="">All Areas / அனைத்து பகுதிகள்</option>
                {areas.map(area => (
                  <option key={area.id} value={area.id}>
                    {area.area_name} ({area.area_identity})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontWeight: '600', whiteSpace: 'nowrap', fontFamily: 'Pavanam, Segoe UI, sans-serif' }}>
                Report Year / அறிக்கை ஆண்டு:
              </label>
              <input
                type="number"
                value={reportYear}
                onChange={(e) => setReportYear(parseInt(e.target.value))}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #8a8886',
                  borderRadius: '4px',
                  fontSize: '14px',
                  width: '120px'
                }}
                min="2020"
                max="2030"
              />
            </div>
          </div>

          <div>
            <button style={buttonStyle} onClick={handleViewReport} disabled={loading}>
              <DocumentPdfRegular style={{ marginRight: '4px' }} />
              {loading ? 'Generating...' : 'Generate PDF'}
            </button>
            <button style={buttonStyle} onClick={handlePrintReport} disabled={loading}>
              <PrintRegular style={{ marginRight: '4px' }} />
              {loading ? 'Generating...' : 'Print'}
            </button>
            <button
              style={{ ...buttonStyle, backgroundColor: 'white', color: '#B5316A', border: '1px solid #B5316A' }}
              onClick={handleRefresh}
              disabled={loading}
            >
              <ArrowClockwiseRegular style={{ marginRight: '4px' }} />
              Refresh
            </button>
          </div>
        </div>

        {/* Data Display */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 16px 0' }}>சபை அங்கத்தினர் ஜாபிதா</h3>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#605e5c' }}>
              Loading congregation data...
            </div>
          ) : congregationData.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '12px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#fafafa' }}>
                    <th style={tableHeaderStyle}>குடும்ப எண்<br/>Family No.</th>
                    <th style={tableHeaderStyle}>பெயர் மற்றும் ஆதார் எண்<br/>Name & Aadhaar</th>
                    <th style={tableHeaderStyle}>வயது<br/>Age</th>
                    <th style={tableHeaderStyle}>1-15</th>
                    <th style={tableHeaderStyle}>16-35</th>
                    <th style={tableHeaderStyle}>35க்கு மேல்<br/>Above 35</th>
                    <th style={tableHeaderStyle}>ஆ.பெ.பி<br/>M.F.O</th>
                    <th style={tableHeaderStyle}>வரிசை எண்<br/>Serial No.</th>
                    <th style={tableHeaderStyle}>ஞானஸ்நானம்<br/>Baptism</th>
                    <th style={tableHeaderStyle}>இராபோஜனம்<br/>Confirmation</th>
                    <th style={tableHeaderStyle}>குறிப்புகள்<br/>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {renderCongregationRows()}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#605e5c' }}>
              தரவு இல்லை / No congregation data found
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
      </div>
    </ErrorBoundary>
  );
};

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ SabaiJabithaPage Error Boundary caught an error:', error);
    console.error('❌ Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 32px)',
          backgroundColor: '#f8f8f8',
          padding: '40px',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '40px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e1dfdd',
            textAlign: 'center',
            maxWidth: '600px'
          }}>
            <h2 style={{ color: '#d13438', marginBottom: '16px' }}>
              Something went wrong with the Sabai Jabitha page
            </h2>
            <p style={{ marginBottom: '20px' }}>
              An error occurred while processing the page. This might be due to PDF generation or data loading issues.
            </p>
            <button
              style={{
                backgroundColor: '#B5316A',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                marginRight: '10px'
              }}
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
            <button
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              onClick={() => window.history.back()}
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SabaiJabithaPage;