import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { makeStyles } from '@fluentui/react-components';
import {
  HomeRegular,
  PeopleRegular,
  AddRegular,
  EditRegular,
  SearchRegular
} from '@fluentui/react-icons';
import StatusBar from './StatusBar';
import Breadcrumb from './Breadcrumb';
import MembersDataGrid from './MembersDataGrid';

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
    padding: '20px 40px 40px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    overflowY: 'auto',
    overflowX: 'hidden',
    minHeight: '0',
  },
  familyDetailsSection: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
    padding: '24px',
  },
  familyDetailsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e1dfdd',
  },
  familyTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#323130',
    margin: '0',
  },
  editButton: {
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#A12B5E',
    },
  },
  familyDetailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  detailLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#605e5c',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  detailValue: {
    fontSize: '14px',
    color: '#323130',
    padding: '8px',
    backgroundColor: '#f8f8f8',
    borderRadius: '4px',
    border: '1px solid #e1dfdd',
  },
  membersSection: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  membersHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e1dfdd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    gap: '16px',
  },
  membersTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#323130',
    margin: '0',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  searchInputContainer: {
    position: 'relative',
    width: '250px',
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px 8px 32px',
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
  searchIcon: {
    position: 'absolute',
    left: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#605e5c',
    fontSize: '16px',
  },
  createButton: {
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#A12B5E',
    },
  },
  membersContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
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

const FamilyPage = ({
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

  // State
  const [currentArea, setCurrentArea] = useState(null);
  const [currentFamily, setCurrentFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersSearchTerm, setMembersSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load family and members data
  useEffect(() => {
    if (areaId && familyId && user) {
      loadFamilyAndMembers();
    }
  }, [areaId, familyId, user?.id]);

  const loadFamilyAndMembers = async () => {
    if (!areaId || !familyId || !user) return;
    
    setLoading(true);
    setError(null);

    try {
      // First, get the area info
      if (!currentChurch) {
        setError('No church selected');
        setLoading(false);
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
          
          // Load families for this area to get the specific family
          const familiesResult = await window.electron.family.getByArea({
            areaId: area.id,
            userId: user.id
          });
          
          if (familiesResult.success) {
            const family = familiesResult.families.find(f => f.id === parseInt(familyId));
            if (family) {
              setCurrentFamily(family);
              
              // Load members for this family
              const membersResult = await window.electron.member.getByFamily({
                familyId: family.id,
                userId: user.id
              });
              
              if (membersResult.success) {
                setMembers(membersResult.members || []);
              } else {
                console.error('Failed to load members:', membersResult.error);
                setMembers([]);
              }
            } else {
              setError('Family not found');
            }
          } else {
            console.error('Failed to load families:', familiesResult.error);
            setError('Failed to load family information');
          }
        } else {
          setError('Area not found');
        }
      } else {
        console.error('Failed to load areas:', areasResult.error);
        setError('Failed to load area information');
      }
    } catch (error) {
      console.error('Error loading family data:', error);
      setError('Failed to load family data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMember = () => {
    navigate(`/area/${areaId}/family/${familyId}/member/create`);
  };

  const handleEditFamily = () => {
    navigate(`/area/${areaId}/family/edit/${familyId}`, {
      state: { familyData: currentFamily }
    });
  };

  const handleEditMember = (member) => {
    navigate(`/area/${areaId}/family/${familyId}/member/edit/${member.id}`, {
      state: { memberData: member }
    });
  };

  const handleViewMember = (member) => {
    navigate(`/area/${areaId}/family/${familyId}/member/${member.id}`);
  };

  const handleMemberUpdated = (member) => {
    setMembers(prev => prev.map(m => m.id === member.id ? member : m));
  };

  const handleMemberDeleted = (memberId) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
  };

  const handleBackToArea = () => {
    navigate(`/area/${areaId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/church-dashboard');
  };

  const formatFamilyName = (family) => {
    if (!family) return '';
    const respect = family.respect.charAt(0).toUpperCase() + family.respect.slice(1);
    return `${respect}. ${family.family_name}`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div>Loading family information...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>Error</div>
            <div>{error}</div>
            <button
              onClick={handleBackToArea}
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
              Back to Area
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentArea || !currentFamily) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div>Family not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        pageTitle={`${formatFamilyName(currentFamily)} - ${currentArea.area_name}`}
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
            label: currentArea.area_name,
            onClick: handleBackToArea
          },
          {
            label: formatFamilyName(currentFamily),
            current: true
          }
        ]}
        onNavigate={(path) => navigate(path)}
      />

      {/* Content */}
      <div className={styles.content}>
        {/* Family Details Section */}
        <div className={styles.familyDetailsSection}>
          <div className={styles.familyDetailsHeader}>
            <h2 className={styles.familyTitle}>{formatFamilyName(currentFamily)}</h2>
            <button
              className={styles.editButton}
              onClick={handleEditFamily}
              type="button"
            >
              <EditRegular />
              Edit Family
            </button>
          </div>
          <div className={styles.familyDetailsGrid}>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Family Number</div>
              <div className={styles.detailValue}>{currentFamily.family_number}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Layout Number</div>
              <div className={styles.detailValue}>{currentFamily.layout_number}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Phone Number</div>
              <div className={styles.detailValue}>{currentFamily.family_phone || '-'}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Email</div>
              <div className={styles.detailValue}>{currentFamily.family_email || '-'}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Address</div>
              <div className={styles.detailValue}>{currentFamily.family_address || '-'}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Prayer Cell</div>
              <div className={styles.detailValue}>{currentFamily.prayer_cell_name || '-'}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Notes</div>
              <div className={styles.detailValue}>{currentFamily.notes || '-'}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Prayer Points</div>
              <div className={styles.detailValue}>{currentFamily.prayer_points || '-'}</div>
            </div>
          </div>
        </div>

        {/* Members Section */}
        <div className={styles.membersSection}>
          <div className={styles.membersHeader}>
            <h2 className={styles.membersTitle}>Family Members ({members.length})</h2>
            <div className={styles.headerActions}>
              <div className={styles.searchInputContainer}>
                <SearchRegular className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={membersSearchTerm}
                  onChange={(e) => setMembersSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <button
                className={styles.createButton}
                onClick={handleCreateMember}
                type="button"
              >
                <AddRegular />
                Create Member
              </button>
            </div>
          </div>
          <div className={styles.membersContent}>
            <MembersDataGrid
              members={members}
              onView={handleViewMember}
              onEdit={handleEditMember}
              onDelete={handleMemberDeleted}
              user={user}
              currentFamily={currentFamily}
              searchTerm={membersSearchTerm}
            />
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

export default FamilyPage;